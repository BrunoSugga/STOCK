from flask import Flask

def create_app():
    app = Flask(__name__)
    
    # Configuraciones
    app.config['SECRET_KEY'] = 'tu_clave_secreta'

    # Importa y registra las rutas
    from .routes import main
    app.register_blueprint(main)

    return app
