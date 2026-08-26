-- Seed content: plants, diseases, crops (content-only)

INSERT INTO public.plants (plant_name, scientific_name, category, description) VALUES
('Tomato','Solanum lycopersicum','Vegetable','Common garden tomato'),
('Potato','Solanum tuberosum','Vegetable','Starchy tuber crop');

INSERT INTO public.crops (crop_name, scientific_name, season, soil_type, description) VALUES
('Wheat','Triticum aestivum','Winter','Loamy','Staple cereal crop'),
('Maize','Zea mays','Summer','Loamy','Important cereal crop');

-- Example diseases
INSERT INTO public.diseases (plant_id, disease_name, description, severity) VALUES
((select id from public.plants where plant_name='Tomato'), 'Late Blight', 'Fungal disease affecting leaves and tubers', 'high'),
((select id from public.plants where plant_name='Tomato'), 'Early Blight', 'Common fungal leaf disease', 'medium');
