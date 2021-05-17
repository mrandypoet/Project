from flask import Flask,Response
from flask import jsonify
from flask import request,send_file
from scipy.io.wavfile import read as wavread
from scipy.io.wavfile import write as wavwrite
import numpy as np
import wave
import cgi
import contextlib
import base64
import soundfile as sf
from flask_cors import CORS, cross_origin
import subprocess
import glob
import time
import os
import re
from lib import *
import pandas as pd

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/file', methods=['POST'])
@cross_origin()
def post():
    try:
        with open("file.wav", "wb") as vid:
            vid.write(request.data)
        model = request.args['model']
        downsample("file.wav","downsampled_file.wav")
        # command to be run on the terminal
        command = "deepspeech --model models/" + model + ".pbmm --scorer models/" + model + ".scorer --audio downsampled_file.wav"
        proc = subprocess.Popen(
            command,
            shell=True, stdout=subprocess.PIPE)
        output = proc.communicate()[0]
        output = output.decode('utf-8')
        print(output)

        return jsonify(
            username=output
        )
    except:
        return jsonify(username = "Please upload correct audio file")

@app.route('/model',methods=['GET'])
def get():
    model = request.args['model']
    if(model == 'false'):
        model_list = glob.glob('models/*.pbmm')
        model_list = [a.replace('models/',"") for a in model_list]
        model_list = [a.replace('.pbmm',"") for a in model_list]
    else:
        model_list = glob.glob('check_point/*/')
        model_list = [a.replace('check_point/',"") for a in model_list]
        model_list = [a.replace('/',"") for a in model_list]
        model_list.append('new model')
    print(model_list)
    return jsonify(
        username=model_list
    )


@app.route('/training',methods=['POST'])
def training_setup():

    audio_file = request.files['audio']
    audio_file.save("file.wav")

    destination = "audios/train/" + time.strftime("%Y%m%d-%H%M%S") + ".wav"
    downsample("file.wav",destination)
    transcript = request.form['text']
    addr = os.getcwd()+'/'+destination
    size = os.path.getsize(destination)

    transcript = re.sub(r'[^a-z\']',' ',transcript.lower())

    df = pd.DataFrame(np.array([[addr,size,transcript]]),
                   columns=['wav_filename', 'wav_filesize', 'transcript'])

    df.to_csv('audios/train.csv',index = False,sep=',', encoding='utf-8',mode = 'a',header=False)

    return jsonify(username = "files are saved")

@app.route('/downloadData',methods=['GET'])
def downloadData():
    inc_aud = request.args['inc_aud']
    inc_aud = True if inc_aud == "true" else False
    print(inc_aud)
    zipping_files(inc_aud,'audios/','my_python_files.zip')

    path = "my_python_files.zip"
    try:
        return send_file(path, as_attachment=True)
    except:
        print("error")

@app.route('/uploadData',methods=['POST'])
def uploadData():
    try:
        # save the zip file
        with open("data.zip", "wb") as file:
            file.write(request.data)
        #unzip the file
        doc = 'data.zip'
        with ZipFile(doc, 'r') as zip_ref:
            zip_ref.extractall('')
            print("file extracted successfully!")

        #correct the path to the audio files
        editing_csv()

        return jsonify(username = "file is successfully extracted");
    except:
        return jsonify(username = "Fail, Please check the input file is a zip file");

@app.route('/uploadTraining',methods=['POST'])
def uploadTraining():
    try:
        # save the specification file
        try:
            os.remove('traning specification.txt')
        except:
            print('no such file')
        with open("training specification.txt", "wb") as file:
            file.write(request.data)

        return jsonify(username = "file is uploaded");
    except:
        return jsonify(username = "Fail, Please check the input specification file");


@app.route('/downloadTraining',methods=['GET'])
def downloadTrainingData():

    print('vvvvvvvvvvvvvvvvv')

    inc_check = request.args['including_checkpoint']
    inc_check = True if inc_check == "true" else False
    model = request.args['model']
    print(model)
    path = "result.zip"
    if(inc_check):
        zipping_files(1,'check_point/'+model+'/',path)
    else:
        zipping_files(1,'check_point'+model+'/summary_dir/',path)

    try:
        return send_file(path, as_attachment=True)
    except:
        print("error")




@app.route('/model_training',methods=['GET'])
def training():
    cwd = os.getcwd()
    os.chdir('DeepSpeech/')

    model = request.args['model']
    if(model == 'new model'):
        model  = create_new_model_dir(cwd);

    print(model)
    with open("../training specification.txt",'r') as myfile:
        command = myfile.read().replace("\n"," ")
        # command = list(filter(None,command.split(' ')))

    command = 'python3 DeepSpeech.py ' +\
    "--train_files ../audios/train.csv --dev_files ../audios/valid.csv --test_files ../audios/test.csv " + \
     command +\
     ' --checkpoint_dir ../check_point/'+ model + \
     ' --summary_dir ../check_point/' + model + "/summary_dir/"\
     " >> ../check_point/" + model + "/summary_dir/result.txt"
    #['>>','result.txt']
    print(command)
    proc = subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE
    )

    output = proc.communicate()
    print(output)
    os.chdir(cwd)


    return jsonify(username = 'training end')




if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080,debug=True)
