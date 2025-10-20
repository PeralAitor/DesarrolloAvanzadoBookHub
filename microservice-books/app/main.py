from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime

# Configuración simple de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://bookhub_user:bookhub_password@mysql:3306/bookhub")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

# Crear tablas
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")
except Exception as e:
    print(f"⚠️ Error creando tablas: {e}")

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
            conn.execute("SELECT 1")
        return {"status": "healthy", "service": "books", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "service": "books", "database": "disconnected", "error": str(e)}

@app.get("/")
def root():
    return {"message": "BookHub Books Service is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)