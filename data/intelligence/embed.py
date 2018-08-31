import argparse
import os
import sys

"""
import tensorflow as tf
import tensorflow_hub as hub


class TextEmbedder:
    embedder = None
    def __init__(self):
        embedder = hub.Module("https://tfhub.dev/google/universal-sentence-encoder/2")

    def embed(texts):
        similarity_input_placeholder = tf.placeholder(tf.string, shape=(None))
        similarity_message_encodings = self.embedder(similarity_input_placeholder)
        with tf.Session() as session:
            session.run(tf.global_variables_initializer())
            session.run(tf.tables_initializer())
            embeddings = session.run(similarity_message_encodings,
                                     feed_dict={similarity_input_placeholder : texts})
        for text, embedding in zip(texts,embeddings):
            print text, embedding
        return embeddings
"""

import numpy as np

# Using fake embedder until tensorflow starts to work.
class FakeTextEmbedder:
    def __init__(self):
        np.random.seed(22)
    

    def embed(self, texts):
        embeddings = []
        for text in texts:
            random_embedding = np.random.uniform(low=0.0, high=1.0, size=(512,))
            embeddings.append(random_embedding)
        # for text, embedding in zip(texts,embeddings):
        #     print text, embedding
        return embeddings

def main(args_dict):
    text_embedder = FakeTextEmbedder()
    text_embedder.embed(["How are you?", "What is the time?", "What time it is?"])

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--verbose', default=False, action='store_true', help='Report progress to stdout')
    args_dict = vars(parser.parse_args())
    main(args_dict)
