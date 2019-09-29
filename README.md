1. Create a droplet, wait for it to provision, get it's Floating IP, mine is `134.209.5.127`)
1. `docker build . -t noitidart/my-private-container:the-sails-docker-droplet-app` (replace `noitidart` with your username and `my-private-container` with the name of your private container repo on docker hub)
   * Test if it runs with `docker run noitidart/my-private-container:the-sails-docker-droplet-app`
1. `docker login` login with your credentials
1. `docker push noitidart/my-private-container:the-sails-docker-droplet-app`
   * look at hash and take note of it. we'll compare when we pull on droplet
1. Then ssh to droplet `ssh root@134.209.5.127` (this is the Floating IP we got earlier)
1. Install docker there with:
   * `curl -L https://get.docker.com/ > getdocker.sh`
   * `chmod +x getdocker.sh`
   * `sudo ./getdocker.sh`
1. `docker login` with your credentials
1. `docker pull noitidart/my-private-container:the-sails-docker-droplet-app`
1. `docker run -p 1337:1337 -d --restart=always noitidart/my-private-container:the-sails-docker-droplet-app`
  * Note to stop it do `docker ps` find the container id then do `docker stop CONTAINER_ID_HERE`
1. Wait for it to lift, you can figure out by getting yoru container id from `docker ps` then `docker logs -f THE_CONTAINE_ID_HERE`
1. Check your non-https site out at http://134.209.5.127:1337

1. We can't get a SSL for this IP, so go to your domain registrar (GoDaddy for me) and then "Manage DNS" and then for the "A" name set Host to default (is usually empty but in case of GoDaddy it is `@`) and for Value put `134.209.5.127` our floating ip. My domain is `themasjid.app`. Hit save.
1. Update your baseUrl and allowedSockets in production.env
1. Rebuild container, repush, then ssh to instance, and repull, then get container id, then stop the container then rerun:
   * `docker build . -t noitidart/my-private-container:the-sails-docker-droplet-app`
   * `docker push noitidart/my-private-container:the-sails-docker-droplet-app`
   * `ssh root@134.209.5.127`
   * `docker ps`
   * `docker stop 845cdeaa6fe0`
   * `docker pull noitidart/my-private-container:the-sails-docker-droplet-app`
   * `docker run -p 1337:1337 -d --restart=always noitidart/my-private-container:the-sails-docker-droplet-app`
1. Keep trying http://themasjid.app till it loads. (it actually won't in my case here, as `.app` domains auto redir to https, but even if you are using .app domain continue on and we'll get it working)

1. In production.js set baseUrl to https and allowedOrigins to https (see commit). And then session.cookie.secure set to true and then http.trustProxy set to true. Save and redeploy container as we did just above ("Rebuild container, repush, then ssh to instance, and repull, then get container id, then stop the container then rerun")
1. Now let's make this https, by `ssh root@134.209.5.127`
1. `sudo apt-get update`
1. `sudo apt-get install nginx`
1. `vim /etc/nginx/sites-available/themasjid.app` and fill it with this:

    ```
    server {
        listen 80;
        server_name themasjid.app www.themasjid.app;

        location / {
            proxy_pass http://localhost:1337;
            proxy_redirect     off;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            proxy_set_header   Host             $host;
            proxy_set_header   X-Real-IP        $remote_addr;
            proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

1. `sudo ln -s /etc/nginx/sites-available/themasjid.app /etc/nginx/sites-enabled`
1. `sudo nginx -t` make sure test passes, if it fails you made a typo in the `themasjid.app` file, fix it until this test passes with:

    ```
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    ```
1. `sudo service nginx reload`

1. Then follow the steps here - https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx
   * For step 4, where it asks " Choose how you'd like to run Certbot " do the " Either get and install your certificates... " option which is `sudo certbot --nginx`
   * It will then ask you to enter numbers for the sites you want, I entered `1,2` to get `themasjid.app` and `www.themasjid.app` then hit enter
   * Then for if want to redirect http to https I said yes so I entered `2` then hit enter
   * Then go to http://themasjid.app and you will see it auto redirs you to https://themasjid.app and it works!