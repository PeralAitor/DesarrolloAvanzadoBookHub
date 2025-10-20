CREATE DATABASE IF NOT EXISTS bookhub;
USE bookhub;

-- Tabla de autores
CREATE TABLE autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    biografia TEXT,
    nacionalidad VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de libros
CREATE TABLE libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    anio_publicacion INT,
    genero VARCHAR(100),
    editorial VARCHAR(255),
    descripcion TEXT,
    portada_url VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_titulo (titulo),
    INDEX idx_autor (autor),
    INDEX idx_genero (genero),
    INDEX idx_isbn (isbn)
);

-- Datos de ejemplo
INSERT INTO autores (nombre, biografia, nacionalidad) VALUES
('Gabriel Garcia Marquez', 'Escritor y periodista colombiano, premio Nobel de Literatura en 1982.', 'Colombiana'),
('Isabel Allende', 'Escritora chilena, conocida por sus novelas de realismo magico.', 'Chilena'),
('Jorge Luis Borges', 'Escritor argentino, uno de los autores mas destacados de la literatura del siglo XX.', 'Argentina');

INSERT INTO libros (titulo, autor, isbn, anio_publicacion, genero, editorial, descripcion) VALUES
('Cien anos de soledad', 'Gabriel Garcia Marquez', '9788437604947', 1967, 'Realismo magico', 'Editorial Sudamericana', 'Una saga familiar en el pueblo ficticio de Macondo.'),
('La casa de los espiritus', 'Isabel Allende', '9788401337203', 1982, 'Realismo magico', 'Plaza & Janes', 'Historia de la familia Trueba a lo largo de cuatro generaciones.'),
('Ficciones', 'Jorge Luis Borges', '9788437604923', 1944, 'Ficcion', 'Editorial Sur', 'Coleccion de cuentos que exploran temas filosoficos y literarios.');