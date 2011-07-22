## Install

#### Node and NPM are already installed locally

commando is meant to be installed locally. If you already have npm and node setup in your home directory then you only need the following command:

    npm install commando

You then want to create a config file as detailed in the config section. This file should live at **~/.commando**. Alternatively you can use the **--config** switch to tell commando where its config is located.

If you are on ubuntu you want to copy the upstart file in install/upstart to /etc/init. You'll likely want to change the paths to point to your node and commando installations.

    sudo cp upstart/commando.conf /etc/init


#### Node is not installed

In order to use commando you must have node.js installed locally. It is preferable that a commando user be setup and install done in /home/commando. This way you can use the upstart script to control commando if you are on Ubuntu. 

    cd commando/install && ./install.sh

You then want to create a config file as detailed in the config section. This file should live at **~/.commando**. Alternatively you can use the **--config** switch to tell commando where its config is located.

If you are on ubuntu you want to copy the upstart file in install/upstart to /etc/init

    sudo cp upstart/commando.conf /etc/init