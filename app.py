from flask import Flask
import os

app = Flask(__name__)
# Port number is required to fetch from env variable
# http://docs.cloudfoundry.org/devguide/deploy-apps/environment-variable.html#PORT


# set the port dynamically with a default of 3000 for local development
port = int(os.getenv('PORT', '3000'))


# Only get method by default
@app.route('/test')
def hello():
    return 'Hello World fro python!'

# start the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
