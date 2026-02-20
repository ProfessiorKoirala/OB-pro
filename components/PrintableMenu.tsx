import React, { useMemo } from 'react';
import { Product, BusinessProfile } from '../types';

interface PrintableMenuProps {
    products: Product[];
    businessProfile: BusinessProfile;
}

const PrintableMenu: React.FC<PrintableMenuProps> = ({ products, businessProfile }) => {
    const groupedAndSortedProducts = useMemo(() => {
        const categories: { [key: string]: Product[] } = {};
        
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });

        // Sort products within each category by price (ascending)
        for (const category in categories) {
            categories[category].sort((a, b) => a.price - b.price);
        }

        // Return sorted categories
        return Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]));

    }, [products]);

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500&display=swap');
        body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; color: #333; background: #fff; }
        .menu-container { width: 100%; max-width: 600px; margin: auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .header h1 { font-family: 'Playfair Display', serif; margin: 0; font-size: 2.5em; font-weight: 700; }
        .header p { margin: 5px 0 0; font-size: 0.9em; }
        .category-section { margin-bottom: 25px; page-break-inside: avoid; }
        .category-title { font-family: 'Playfair Display', serif; font-size: 1.8em; font-weight: 700; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
        .menu-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .item-name { font-weight: 500; font-size: 1em; padding-right: 8px; }
        .item-dots { flex-grow: 1; border-bottom: 1px dotted #999; margin: 0 8px; transform: translateY(-4px); }
        .item-price { font-weight: 500; font-size: 1em; padding-left: 8px; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; font-style: italic; }
    `;
    
    return (
        <>
            <style>{styles}</style>
            <div className="menu-container">
                <header className="header">
                    <h1>{businessProfile.businessName}</h1>
                    <p>Menu</p>
                </header>

                {groupedAndSortedProducts.map(([category, products]) => (
                    <section key={category} className="category-section">
                        <h2 className="category-title">{category}</h2>
                        {products.map(product => (
                            <div key={product.id} className="menu-item">
                                <span className="item-name">{product.name}</span>
                                <span className="item-dots"></span>
                                <span className="item-price">₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </section>
                ))}

                <footer className="footer">
                    <p>Prices are inclusive of all taxes.</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableMenu;
