from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import os
import requests
from datetime import datetime
import time

# Configuración simple de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://bookhub_user:bookhub_password@mysql:3306/bookhub")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def wait_for_db():
    """Espera a que la base de datos esté disponible"""
    max_retries = 30
    retry_interval = 2  # segundos
    
    for attempt in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Base de datos conectada exitosamente")
            return True
        except Exception as e:
            print(f"⚠️ Intento {attempt+1}/{max_retries}: Base de datos no disponible - {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_interval)
    
    print("❌ No se pudo conectar a la base de datos después de varios intentos")
    return False

# Modelo simple
class BookDB(Base):
    __tablename__ = "libros"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    autor = Column(String(255), nullable=False)
    isbn = Column(String(20), unique=True, index=True)
    anio_publicacion = Column(Integer)
    genero = Column(String(100))
    editorial = Column(String(255))
    descripcion = Column(Text)
    portada_url = Column(String(500))
    fecha_creacion = Column(DateTime)  # Sin default=datetime.utcnow

# Esperar a la base de datos y luego crear tablas
if wait_for_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente")
    except Exception as e:
        print(f"⚠️ Error creando tablas: {e}")
else:
    print("❌ No se pudieron crear las tablas - base de datos no disponible")

app = FastAPI(title="BookHub Books Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para buscar en Open Library
def search_open_library(search: str = None, autor: str = None, genero: str = None):
    try:
        # Construir query para Open Library
        query_parts = []
        if search:
            query_parts.append(search)
        elif autor:
            query_parts.append(f"author:\"{autor}\"")
        elif genero:
            query_parts.append(f"subject:\"{genero}\"")
        else:
            # Query por defecto para mostrar libros populares
            query_parts.append("popular books")
        
        query = " ".join(query_parts)
        
        # Hacer petición a Open Library
        response = requests.get(
            f"https://openlibrary.org/search.json",
            params={
                'q': query,
                'limit': 50,
                'fields': 'key,title,author_name,isbn,first_publish_year,subject,publisher,cover_i'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get('docs', [])
        else:
            print(f"Error en Open Library: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error conectando con Open Library: {e}")
        return []

# Función para guardar un libro de Open Library en la base de datos
def save_open_library_book_to_db(db: Session, open_library_book: dict):
    try:
        # Extraer el ISBN (puede haber varios, tomamos el primero)
        isbn = open_library_book.get('isbn', [''])[0] if open_library_book.get('isbn') else None
        
        # Verificar si el libro ya existe por ISBN
        existing_book = None
        if isbn:
            existing_book = db.query(BookDB).filter(BookDB.isbn == isbn).first()
        
        # Si no existe por ISBN, verificar por título y autor
        if not existing_book:
            titulo = open_library_book.get('title', 'Título no disponible')
            autor = ', '.join(open_library_book.get('author_name', [])) if open_library_book.get('author_name') else 'Autor desconocido'
            existing_book = db.query(BookDB).filter(BookDB.titulo == titulo, BookDB.autor == autor).first()
        
        # Si ya existe, retornar el existente
        if existing_book:
            return existing_book
        
        # Obtener la fecha de publicación de Open Library y convertirla a datetime
        first_publish_year = open_library_book.get('first_publish_year')
        fecha_publicacion = None
        
        if first_publish_year:
            try:
                # Crear una fecha al 1 de enero del año de publicación
                fecha_publicacion = datetime(year=first_publish_year, month=1, day=1)
            except (ValueError, TypeError):
                # Si hay error con la fecha, usar None y luego se asignará la fecha actual
                fecha_publicacion = None
        
        # Si no se pudo obtener la fecha de publicación, usar la fecha actual
        if not fecha_publicacion:
            fecha_publicacion = datetime.utcnow()
        
        # Crear nuevo libro
        new_book = BookDB(
            titulo=open_library_book.get('title', 'Título no disponible'),
            autor=', '.join(open_library_book.get('author_name', [])) if open_library_book.get('author_name') else 'Autor desconocido',
            isbn=isbn,
            anio_publicacion=first_publish_year,
            genero=', '.join(open_library_book.get('subject', [])[:3]) if open_library_book.get('subject') else 'General',
            editorial=', '.join(open_library_book.get('publisher', [])[:3]) if open_library_book.get('publisher') else 'Editorial desconocida',
            descripcion=f"Libro {open_library_book.get('title', '')} por {', '.join(open_library_book.get('author_name', [])) if open_library_book.get('author_name') else 'autor desconocido'}.",
            portada_url=f"https://covers.openlibrary.org/b/id/{open_library_book.get('cover_i')}-M.jpg" if open_library_book.get('cover_i') else None,
            fecha_creacion=fecha_publicacion  # Usar la fecha de publicación en lugar de fecha actual
        )
        
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        return new_book
        
    except Exception as e:
        db.rollback()
        print(f"Error guardando libro en la base de datos: {e}")
        return None

@app.get("/api/v1/books")
def get_books(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = Query(None),
    genero: Optional[str] = Query(None),
    autor: Optional[str] = Query(None),
    anio_min: Optional[int] = Query(None),
    anio_max: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # Primero, intentar buscar en Open Library si hay parámetros de búsqueda
        if search or autor or genero:
            open_library_books = search_open_library(search, autor, genero)
            
            # Guardar cada libro de Open Library en la base de datos local
            for open_book in open_library_books:
                save_open_library_book_to_db(db, open_book)
        
        # Ahora, buscar en la base de datos local
        query = db.query(BookDB)
        
        if search:
            query = query.filter(
                BookDB.titulo.ilike(f"%{search}%") | 
                BookDB.autor.ilike(f"%{search}%") |
                BookDB.descripcion.ilike(f"%{search}%")
            )
        
        if genero:
            query = query.filter(BookDB.genero.ilike(f"%{genero}%"))
        
        if autor:
            query = query.filter(BookDB.autor.ilike(f"%{autor}%"))
        
        if anio_min:
            query = query.filter(BookDB.anio_publicacion >= anio_min)
        
        if anio_max:
            query = query.filter(BookDB.anio_publicacion <= anio_max)
        
        books = query.offset(skip).limit(limit).all()
        return books
            
    except Exception as e:
        print(f"Error en get_books: {e}")
        # Fallback a base de datos en caso de error
        books = db.query(BookDB).offset(skip).limit(limit).all()
        return books

@app.get("/api/v1/books/{book_id}")
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@app.get("/health")
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "service": "books", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "service": "books", "database": "disconnected", "error": str(e)}

@app.get("/")
def root():
    return {"message": "BookHub Books Service is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)