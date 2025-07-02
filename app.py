from flask import Flask, send_from_directory, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    # Serve the HTML file
    return send_from_directory('.', 'index.html')

@app.route('/index.js')
def serve_js():
    return send_from_directory('.', 'index.js')

@app.route('/avatar.glb')
def serve_glb():
    return send_from_directory('.', 'avatar.glb')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)