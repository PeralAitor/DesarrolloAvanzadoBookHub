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
('Mario Vargas Llosa', 'Escritor peruano-español, premio Nobel de Literatura en 2010.', 'Peruana'),
('Julio Cortázar', 'Escritor e intelectual argentino, maestro del relato corto y la narrativa fantástica.', 'Argentina'),
('Laura Esquivel', 'Escritora mexicana, conocida por su estilo mágico y culinario.', 'Mexicana'),
('Carlos Fuentes', 'Novelista y ensayista mexicano, figura clave del boom latinoamericano.', 'Mexicana'),
('Clarice Lispector', 'Escritora brasileña de origen ucraniano, considerada una de las más importantes del siglo XX.', 'Brasileña');

INSERT INTO libros (titulo, autor, isbn, anio_publicacion, genero, editorial, descripcion, portada_url) VALUES
('El amor en los tiempos del cólera', 'Gabriel Garcia Marquez', '9788437604954', 1985, 'Romance', 'Editorial Oveja Negra', 'Historia de amor que atraviesa décadas en el Caribe colombiano.', 'https://ejemplo.com/portada_amor_colera.jpg'),
('La ciudad y los perros', 'Mario Vargas Llosa', '9788437604961', 1963, 'Novela literaria', 'Seix Barral', 'Crítica social en una academia militar limeña.', 'https://ejemplo.com/portada_ciudad_perros.jpg'),
('Rayuela', 'Julio Cortázar', '9788437604978', 1963, 'Novela experimental', 'Editorial Sudamericana', 'Obra innovadora que puede leerse en múltiples órdenes.', 'https://ejemplo.com/portada_rayuela.jpg'),
('Como agua para chocolate', 'Laura Esquivel', '9788437604985', 1989, 'Realismo mágico', 'Editorial Doubleday', 'Novela que mezcla amor, cocina y tradiciones mexicanas.', 'https://ejemplo.com/portada_agua_chocolate.jpg'),
('La muerte de Artemio Cruz', 'Carlos Fuentes', '9788437604992', 1962, 'Novela política', 'Fondo de Cultura Económica', 'Reflexión sobre el poder y la identidad mexicana.', 'https://ejemplo.com/portada_artemio_cruz.jpg'),
('La hora de la estrella', 'Clarice Lispector', '9788437605005', 1977, 'Ficción literaria', 'Editorial Nuevo Siglo', 'Historia existencial de una oficinista en Río de Janeiro.', 'https://ejemplo.com/portada_estrella.jpg'),
('El aleph', 'Jorge Luis Borges', '9788437605012', 1949, 'Ficcion filosofica', 'Editorial Losada', 'Colección de cuentos sobre infinito y realidad.', 'https://ejemplo.com/portada_aleph.jpg'),
('Paula', 'Isabel Allende', '9788437605029', 1994, 'Memorias', 'Plaza & Janés', 'Conmovedor testimonio sobre la enfermedad de su hija.', 'https://ejemplo.com/portada_paula.jpg'),
('Travesuras de la niña mala', 'Mario Vargas Llosa', '9788437605036', 2006, 'Novela romántica', 'Alfaguara', 'Historia de amor obsesivo a través de décadas y países.', 'https://ejemplo.com/portada_nina_mala.jpg'),
('Bestiario', 'Julio Cortázar', '9788437605043', 1951, 'Cuentos fantásticos', 'Editorial Sudamericana', 'Primera colección de cuentos del autor.', 'https://ejemplo.com/portada_bestiario.jpg');