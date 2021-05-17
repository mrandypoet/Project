# Project
To setup the working environment for this project, the user needs to rst copy the code from the
github address: https://github.com/mrandypoet/Project. And following the instructions below:
1. Navigate the root working directory for the backend folder, runs command "xargs -a linux requirements.txt
sudo apt-get install" for setup the Linux environment. And then use "pip3 install -r python requirements.txt"
to install the necessary package for python environment. Finally, runs the "python3 server.py"
command to launch the server.
2. To setup the DeepSpeech training environment, user needs to navigate the DeepSpeech folder
within the backend directory, and runs "pip3 install {upgrade pip==20.2.2 wheel==0.34.2
setuptools==49.6.0" and "pip3 install {upgrade -e .". The further installation guide can be
found on the DeepSpeech documentation.[1]
3. Change the working directory to the web folder, if angular is been installed, then runs "npm
install" to install the required package. Otherwise, user needs to install Angular 11 rst.
The installation guide can be found in Angular homepage.[4] When everything is done, in
the web directory, runs "ng serve" command to set up the website. To access the website,
the default address is "localhost:4200".
