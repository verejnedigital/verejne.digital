# coding=utf-8
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

from gensim.models import KeyedVectors
import string
import numpy as np
from string import maketrans

def tokenize(text):
    return text.translate(dict((x, None) for x in string.punctuation)).lower().split()

class Word2VecEmbedder:
    sk_model = None
    word_frequency = {}
    count_words = 0
    dimension = 300

    def __init__(self, all_texts):
        # Creating the model
        print "Reading the pretrained model for Word2VecEmbedder"
        self.sk_model = KeyedVectors.load_word2vec_format('/data/verejne/datautils/embedding_data/slovak.vec', encoding='utf-8', unicode_errors='ignore')
        print "Model contains", len(self.sk_model.vocab), "tokens"
        self.dimension = len(self.sk_model["auto"])
        print ("sídlisk" in self.sk_model)
        print ("sídlisk".decode('utf-8') in self.sk_model)

        print "Dimension of embedding of 'auto' is", self.dimension
        # Create frequecny table for words
        if all_texts is None:
            return
        for text in all_texts:
            words = tokenize(text)
            if len(words) == 0 or words is None:
                return
            for word in words:
                self.count_words +=1
                if word in self.word_frequency:
                    self.word_frequency[word] += 1
                else:
                    self.word_frequency[word] = 1
        print "Frequency table ready. Number of words:", self.count_words, "Number of distinct words:", len(self.word_frequency)

    def multiplier(self, word):
        if word in self.word_frequency:
            return 1.0 / self.word_frequency[word]
        else:
            return 1.0

    def embed(self, texts):
        embeddings = []
        if texts is None or len(texts) == 0:
            return
        for text in texts:
            embedding = np.zeros(self.dimension)
            words = tokenize(text)
            if words is None or len(words) == 0:
                embeddings.append(embedding)
                continue
            for word in words:
                if word in self.sk_model and len(word)>2:
                    embedding = np.add(embedding, np.multiply(self.multiplier(word), self.sk_model[word]))
            embeddings.append(embedding)
        return embeddings


# Using fake embedder until tensorflow starts to work.
class FakeTextEmbedder:
    def __init__(self):
        np.random.seed(22)


    def embed(self, texts):
        embeddings = []
        for text in texts:
            random_embedding = np.random.uniform(low=0.0, high=1.0, size=(512,))
            embeddings.append(random_embedding)
        return embeddings

def main(args_dict):
    text_embedder = FakeTextEmbedder()
    text_embedder.embed(["How are you?", "What is the time?", "What time it is?"])

    texts = [
        u"Regenerácia vnútroblokov sídlisk mesta Brezno",
        u"Územný plán mesta Brezno",
        u"Oprava miestnych komunikácií v katastrálnom území mesta Brezno",
        u"Kompostéry pre obec Kamenec pod Vtáčnikom",
        u"Most cez potok Kamenec , Bardejov - mestská časť Dlhá Lúka",
        u"Oprava miestnych komunikácií v katastrálnom území Trencin"]
    word2vec_embedder = Word2VecEmbedder(texts)
    embeddings = word2vec_embedder.embed(texts)
    print 'Similarities:'
    for emb1, text1 in zip(embeddings, texts):
        for emb2, text2 in zip(embeddings, texts):
            similarity = np.inner(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            print similarity, text1, ' ----', text2

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--verbose', default=False, action='store_true', help='Report progress to stdout')
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
