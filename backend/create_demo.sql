-- Crear cliente demo
INSERT INTO clients (id, name, slug, description) VALUES 
('demo-001', 'Cliente Demo', 'demo-client', 'Esta es una cuenta de demostración para probar el feed de Instagram.');

-- Crear post de prueba
INSERT INTO posts (id, client_id, type, position, caption, hashtags, likes_count, file_count, storage_path) VALUES 
('post-001', 'demo-001', 'single', 1, '¡Bienvenido a nuestra cuenta de demostración! 🎉 Esta es una prueba del nuevo diseño profesional tipo Instagram Web.', '#demo #instapreview #instagram #socialmedia', 42, 1, 'demo/post-001');

