# coding=utf-8
import argparse

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


def tokenize(text):
    return text.translate(dict((x, None) for x in string.punctuation)).lower().split()


class Word2VecEmbedder:
    sk_model = None
    word_frequency = {}
    # We try to cluster similar words together. This map provides mapping for word to the
    # corresponding similar word.
    word_to_similar_word = {}
    count_words = 0
    dimension = None
    used_words = set()

    def __init__(self, all_texts):
        # Creating the model
        print("Reading the pretrained model for Word2VecEmbedder")
        self.sk_model = KeyedVectors.load_word2vec_format(
            '/data/verejne/datautils/embedding_data/slovak.vec', encoding='utf-8', unicode_errors='ignore')
        # print("Model contains", len(self.sk_model.vocab), "tokens")
        print(self.sk_model.similarity("mesto", "mesta"))
        self.dimension = len(self.sk_model["auto"])
        print("sídlisk" in self.sk_model)
        # print("sídlisk".encode('utf8') in self.sk_model)

        print("Dimension of embedding of 'auto' is", self.dimension)
        # Create frequency table for words
        if all_texts is None:
            return

        for text in all_texts:
            self.add_text_to_corpus(text)
        self.print_corpus_stats()

    def print_corpus_stats(self):
        print("Frequency table ready. Number of words:", self.count_words)
        print("Number of distinct words:", len(self.word_frequency))
        print("Number of reused words:", len(self.used_words))

    def add_text_to_corpus(self, text):
        words = set(tokenize(text))
        if len(words) == 0 or words is None:
            return
        for word in words:
            self.count_words += 1
            if len(word) <= 2:
                continue
            if word not in self.sk_model:
                continue
            if word in self.word_to_similar_word:
                similar_word = self.word_to_similar_word[word]  # TODO this is not used 0 change to 'word = self.word_to_similar_word[word]'
            else:
                similar_word = self.get_most_similar_word(word)
                self.used_words.add(similar_word)
                self.word_to_similar_word[word] = similar_word

            if word in self.word_frequency:
                self.word_frequency[word] += 1
            else:
                self.word_frequency[word] = 1

    # get the most similar word in the already processed words provide it's at least 0.95 similar
    def get_most_similar_word(self, word):
        return word
        if len(self.used_words) == 0:
            return word
        most_similar = self.sk_model.most_similar_to_given(word, list(self.used_words))
        if self.sk_model.similarity(word, most_similar) >= 0.8:
            return most_similar
        return word

    # returns(embedding, num of words that matched)
    def embed_one_text(self, text):
        assert self.sk_model is not None
        assert self.dimension is not None
        words = tokenize(text)
        if words is None or len(words) == 0:
            return None
        embedding = np.zeros(self.dimension)
        matched_words = 0
        for word in words:
            if word in self.sk_model and len(word) > 2 and word in self.word_to_similar_word:
                lookup_word = self.word_to_similar_word[word]
                count = self.word_frequency[lookup_word]
                # ignore words appearing in only 1 document
                if count <= 1:
                    continue
                # the less common the word, the higher its weight
                weight = 1.0 / count
                embedding = np.add(embedding, np.multiply(weight, self.sk_model[lookup_word]))
                matched_words += 1
        return embedding, matched_words, len(words)

    def embed(self, texts):
        assert self.sk_model is not None
        assert self.dimension is not None
        embeddings = []
        if texts is None or len(texts) == 0:
            return
        for text in texts:
            embedding_data = self.embed_one_text(text)
            if embedding_data is None:
                continue
            embeddings.append(embedding_data[0])
        return embeddings


# Using fake embedder until tensorflow starts to work.
class FakeTextEmbedder:
    def __init__(self):
        np.random.seed(22)

    def embed_one_text(self, text):
        return self.embed([text])[0], 7

    def embed(self, texts):
        embeddings = []
        for _ in texts:
            random_embedding = np.random.uniform(low=0.0, high=1.0, size=(512,))
            embeddings.append(random_embedding)
        return embeddings


def main(args_dict):
    text_embedder = FakeTextEmbedder()
    text_embedder.embed(["How are you?", "What is the time?", "What time it is?"])

    texts = ["Regenerácia vnútroblokov sídlisk mesta Brezno",
             "Územný plán mesta Brezno",
             "Oprava miestnych komunikácií v katastrálnom území mesta Brezno",
             "Kompostéry pre obec Kamenec pod Vtáčnikom",
             "Most cez potok Kamenec , Bardejov - mestská časť Dlhá Lúka",
             "Oprava miestnych komunikácií v katastrálnom území Trencin"]
    word2vec_embedder = Word2VecEmbedder(texts)
    embeddings = word2vec_embedder.embed(texts)
    print('Similarities:')
    for emb1, text1 in zip(embeddings, texts):
        for emb2, text2 in zip(embeddings, texts):
            similarity = np.inner(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            print(similarity, text1, ' ----', text2)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--verbose', default=False, action='store_true', help='Report progress to stdout')
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb
        import sys
        import traceback

        _, _, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
