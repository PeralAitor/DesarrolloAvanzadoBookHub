from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime

Base = declarative_base()

class BookDB(Base):
    __tablename__ = "libros"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    autor = Column(String(255), nullable=False)
    isbn = Column(String(20), unique=True, index=True)
    anio_publicacion = Column(Integer)  # Cambiado aquí
    genero = Column(String(100))
    editorial = Column(String(255))
    descripcion = Column(Text)
    portada_url = Column(String(500))
    fecha_creacion = Column(DateTime)  # Sin valor por defecto

class AuthorDB(Base):
    __tablename__ = "autores"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    biografia = Column(Text)
    nacionalidad = Column(String(100))
    fecha_creacion = Column(DateTime)