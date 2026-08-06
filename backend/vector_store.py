"""
vector_store.py
────────────────
Lightweight local vector store — replaces ChromaDB.

ChromaDB pulls in a large dependency tree (kubernetes client, grpc,
opentelemetry, onnxruntime) meant for production/distributed use, which
blows past small hosting tiers' memory limits for a ~28-document dataset.

This store keeps embeddings in memory (numpy array) and persists them to
disk as .json (ids/docs/metadata) + .npy (embeddings) so they survive
restarts. Cosine similarity search via numpy — plenty fast at this scale.
"""

import os
import json
import numpy as np


class SimpleVectorStore:
    def __init__(self, name: str, storage_dir: str):
        self.name = name
        os.makedirs(storage_dir, exist_ok=True)
        self._json_path = os.path.join(storage_dir, f"{name}.json")
        self._npy_path = os.path.join(storage_dir, f"{name}.npy")

        self.ids = []
        self.documents = []
        self.metadatas = []
        self.embeddings = None  # np.ndarray, shape (n, dim)

        self._load()

    def _load(self):
        if os.path.exists(self._json_path):
            with open(self._json_path, "r") as f:
                data = json.load(f)
            self.ids = data.get("ids", [])
            self.documents = data.get("documents", [])
            self.metadatas = data.get("metadatas", [])
        if os.path.exists(self._npy_path):
            self.embeddings = np.load(self._npy_path)

    def _save(self):
        with open(self._json_path, "w") as f:
            json.dump(
                {"ids": self.ids, "documents": self.documents, "metadatas": self.metadatas},
                f,
            )
        if self.embeddings is not None:
            np.save(self._npy_path, self.embeddings)

    def count(self) -> int:
        return len(self.ids)

    def add(self, ids, embeddings, documents, metadatas):
        emb = np.array(embeddings, dtype=np.float32)
        if emb.ndim == 1:
            emb = emb.reshape(1, -1)
        if self.embeddings is None:
            self.embeddings = emb
        else:
            self.embeddings = np.vstack([self.embeddings, emb])
        self.ids.extend(ids)
        self.documents.extend(documents)
        self.metadatas.extend(metadatas)
        self._save()

    def upsert(self, ids, embeddings, documents, metadatas):
        for doc_id in ids:
            if doc_id in self.ids:
                idx = self.ids.index(doc_id)
                self.ids.pop(idx)
                self.documents.pop(idx)
                self.metadatas.pop(idx)
                if self.embeddings is not None:
                    self.embeddings = np.delete(self.embeddings, idx, axis=0)
        self.add(ids, embeddings, documents, metadatas)

    def query(self, query_embeddings, n_results=5):
        if self.embeddings is None or len(self.ids) == 0:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]]}

        q = np.array(query_embeddings[0], dtype=np.float32)
        doc_norms = np.linalg.norm(self.embeddings, axis=1)
        q_norm = np.linalg.norm(q)
        denom = doc_norms * q_norm
        denom[denom == 0] = 1e-8

        sims = (self.embeddings @ q) / denom
        n = min(n_results, len(self.ids))
        top_idx = np.argsort(-sims)[:n]

        return {
            "ids": [[self.ids[i] for i in top_idx]],
            "documents": [[self.documents[i] for i in top_idx]],
            "metadatas": [[self.metadatas[i] for i in top_idx]],
        }