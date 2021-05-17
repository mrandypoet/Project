import soundfile
import librosa
from zipfile import ZipFile
import pandas as pd
import os
import re

def downsample(src_path,end_path):
    y,sr = librosa.load(src_path,sr= 16000)
    soundfile.write(end_path,y,sr)

def get_all_file_paths(directory):

    # initializing empty file paths list
    file_paths = []

    # crawling through directory and subdirectories
    for root, directories, files in os.walk(directory):
        for filename in files:
            # join the two strings in order to form the full filepath.
            filepath = os.path.join(root, filename)
            file_paths.append(filepath)

    # returning all file paths
    return file_paths


def zipping_files(inc_aud,src_path,end_path):
    file_path = get_all_file_paths(src_path)
    if not inc_aud :
        file_path  = file_path[0:3]

    with ZipFile(end_path,'w') as zip_file:
        for file in file_path:
            zip_file.write(file)

    print('All files zipped!')


def path_correction(df,cwd):
    df['wav_filename'] = df['wav_filename'].apply(lambda x:re.sub('^(.*)(?=train|valid|test)',"", x))
    df['wav_filename'] = df['wav_filename'].apply(lambda x:cwd+x)
    return df;

def editing_csv():
    cwd = os.getcwd() + '/audios/'
    df_training = pd.read_csv('audios/train.csv')
    df_dev = pd.read_csv('audios/valid.csv')
    df_test = pd.read_csv('audios/test.csv')

    path_correction(df_training,cwd).to_csv('audios/train.csv',index = False,sep=',', encoding='utf-8')
    path_correction(df_dev,cwd).to_csv('audios/valid.csv',index = False,sep=',', encoding='utf-8')
    path_correction(df_test,cwd).to_csv('audios/test.csv',index = False,sep=',', encoding='utf-8')


def create_new_model_dir(cwd):
    cwd = cwd +'/checkpoint/'
    i = 1
    folder_name = cwd + "model" + str(i)

    while True:
        if not os.path.exists(folder_name):
            os.mkdir(folder_name)
            break
        i += 1
        folder_name = cwd + "model" + str(i)
