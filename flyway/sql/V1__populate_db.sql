create table if not exists inventory_items (
       id serial,
       name text,
       description text,
       amount integer check (amount > 0)
);

INSERT INTO inventory_items (name, description, amount) VALUES
    ('Heavy-Duty Power Drill', '18V cordless drill with brushless motor and rechargeable battery.', 15),
    ('Steel Bolts (M12 x 50mm, Box of 100)', 'Corrosion-resistant bolts for heavy machinery and construction.', 200),
    ('Ergonomic Office Chair', 'Adjustable chair with lumbar support and breathable mesh backrest.', 10),
    ('50-Inch 4K LED Monitor', 'Ultra HD monitor with HDMI, DisplayPort, and built-in speakers.', 8),
    ('High-Visibility Safety Vest (L, Pack of 5)', 'Reflective vest with Velcro straps, ANSI/ISEA compliant.', 50),
    ('Pallet Jack (5,500 lbs Capacity)', 'Manual hydraulic jack with steel frame and polyurethane wheels.', 5),
    ('Heavy-Duty Storage Rack (5-Tier)', 'Industrial steel shelving with adjustable shelves.', 12),
    ('Rechargeable LED Work Light', '2,000-lumen waterproof LED work light with adjustable stand.', 20),
    ('Multi-Purpose Cleaning Solvent', '1-gallon industrial degreaser for machinery and floors.', 30),
    ('Thermal Barcode Printer', 'High-speed label printer with USB and Wi-Fi connectivity.', 6);
