import os
from collections import defaultdict
import re

def parse_alpha_words(file_path, output_folder):
    os.makedirs(output_folder, exist_ok=True)

    # default dict to make it more space optimized for 500k words
    words_by_length = defaultdict(list)

    # Sort words by length
    with open(file_path, 'r') as file:
        for line in file:
            word = line.strip()
            if word.isalpha():
                words_by_length[len(word)].append(word)

    # Then, write based on length to separate files
    for length, words in words_by_length.items():
        output_file = os.path.join(output_folder, f"{length}_letter_words.txt")
        with open(output_file, 'w') as out_file:
            out_file.write("\n".join(sorted(words)))

    print(f"Alpha words sorted by length and saved to '{output_folder}'.")

def parse_odd_words(file_path, output_folder):
    # So traditional wordle only includes A-Z, but I'll include all words that have non-alphabetic characters
    # Here, I have assumed that odd words are those that have non-alphabetic characters
    # I have a list of all english words in the file, so I'll just find the odd words and save them to a separate file
    os.makedirs(output_folder, exist_ok=True)

    odd_words = []

    with open(file_path, 'r') as file:
        for line in file:
            word = line.strip()
            if re.search(r'[^a-zA-Z]', word):
                odd_words.append(word)

    odd_words_file = os.path.join(output_folder, "odd_words.txt")
    with open(odd_words_file, 'w') as out_file:
        out_file.write("\n".join(sorted(odd_words)))

    print(f"Odd words saved to '{output_folder}/odd_words.txt'.")

def count_words_in_files(output_folder):
    # I wanted to know that I wasn't saving empty files/or files that were insanely large
    # Since Discord API has a 3 second response cut off

    # Count words in each file in the output folder
    for file_name in os.listdir(output_folder):
        file_path = os.path.join(output_folder, file_name)
        if os.path.isfile(file_path):
            with open(file_path, 'r') as file:
                word_count = sum(1 for _ in file)
            print(f"{file_name}: {word_count} words")

# Usage examples
file_path = "words.txt"
output_folder = "word_lists" 

# uncomment the function you want to use
# parse_alpha_words(file_path, output_folder)
# parse_odd_words(file_path, output_folder)
# count_words_in_files(output_folder)
