from flask import Flask, render_template, url_for, jsonify, request
from flask_cors import CORS, cross_origin
from giphy_client.rest import ApiException

import giphy_client
import json
import os

app = Flask(__name__)
api_instance = giphy_client.DefaultApi()
api_key = os.getenv('GIPHY_API_KEY')

@app.route('/app.html', methods=['POST', 'GET'])
@cross_origin()
def index():
    searched = ''
    giphy_gifs = []
    search_term = ''

    if request.method == 'POST':
        # Take the search input
        searched = request.form['searched']
        search_term = request.form['search-term']
        print("Searched: {} -- Search Term: {}".format(searched, search_term))
        # Make a call to the Giphy API - get the JSON object
        # Take the preview URLs from the JSON object and return to the page
        try:
            api_response = api_instance.gifs_search_get(
                api_key, 
                search_term, 
                limit=12, 
                offset=0, 
                rating='pg', 
                lang='en'
            )
            giphy_gifs = api_response.data

        except ApiException as e:
            print("Exception when calling DefaultApi->gifs_search_get: {}".format(e))

    app_js = url_for('static', filename='javascript/app.js')
    return render_template('app.html', js=app_js, searched=searched, giphy_gifs=giphy_gifs, giphy_gifs_len=len(giphy_gifs), term=search_term)

@app.route('/controller.html')
@cross_origin()
def controller():
    controller_js = url_for('static', filename='javascript/controller.js')
    return render_template('controller.html', js=controller_js)

@app.route('/bundle.json')
@cross_origin()
def bundle():
    bundle_json = {
        "applications": [
            {
                "type": "sandbox",
                "id": "symgif",
                "appGroupId": "symgif",
                "name": "Symphony Gif Search",
                "description": "This app allows for searching and sharing Gifs within Symphony! Powered by Giphy.",
                "publisher": "Cloud Engineering",
                "url": "https://localhost:5000/controller.html",
                "domain": "localhost"
            }
        ]
    }

    return jsonify(bundle_json)

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        ssl_context='adhoc'
    )
