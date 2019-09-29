1. Create a droplet, wait for it to provision, get it's Floating IP, mine is `134.209.5.127`)
1. `docker build . -t noitidart/my-private-container:the-sails-docker-droplet-app` (replace `noitidart` with your username and `my-private-container` with the name of your private container repo on docker hub)
   * Test if it runs with `docker run noitidart/my-private-container:the-sails-docker-droplet-app`
1. `docker login` login with your credentials
1. `docker push noitidart/my-private-container:the-sails-docker-droplet-app`
   * look at hash and take note of it. we'll compare when we pull on droplet
1. Then ssh to droplet `ssh root@134.209.5.127` (this is the Floating IP we got earlier)
1. Install docker there with:
   * curl -L https://get.docker.com/ > getdocker.sh
   * chmod +x getdocker.sh
   * sudo ./getdocker.sh
   * sudo usermod -aG docker root
1. `docker login` with your credentials
1. `docker pull noitidart/my-private-container:the-sails-docker-droplet-app`
1. `docker run -p 1337:1337 -d noitidart/my-private-container:the-sails-docker-droplet-app`
1. Wait for it to lift, you can figure out by getting yoru container id from `docker ps` then `docker logs -f THE_CONTAINE_ID_HERE`
1. Check your non-https site out at http://134.209.5.127:1337