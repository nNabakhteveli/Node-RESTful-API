Create `certs` directory in the root of the app and run this command in the `certs` directory to create certificates for HTTPS:

`$ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`
