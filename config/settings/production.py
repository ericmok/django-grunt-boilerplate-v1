from .base import *

with open( os.path.join(SETTINGS_DIR, 'db.key') ) as f:
	DATABASE_PASSWORD = f.read().strip()

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        'USERNAME': '',
        'PASSWORD': DATABASE_PASSWORD
    }
}

