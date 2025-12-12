import { useState, useEffect } from 'react'
import './App.css'

interface Country {
    name: {
        common: string;
        official: string;
    };
}

interface CountryDetails {
    name: {
        common: string;
        official: string;
    };
    capital: string[];
    currencies: {
        [key: string]: {
            name: string;
            symbol: string;
        };
    };
    flags: {
        png: string;
        svg: string;
        alt: string;
    };
}

function App() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<CountryDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchCountries() {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
                const data: Country[] = await response.json();

                data.sort((a, b) => a.name.common.localeCompare(b.name.common));
                setCountries(data);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        }
        fetchCountries();
    }, []);

    async function handleCountrySelect(countryName: string) {
        if (!countryName) {
            setSelectedCountry(null);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,capital,currencies,flags`
            );
            const data: CountryDetails[] = await response.json();
            setSelectedCountry(data[0]);
        } catch (error) {
            console.error('Error fetching country details:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h1>Country Facts</h1>
            <select
                onChange={(e) => handleCountrySelect(e.target.value)}
                defaultValue=""
            >
                <option value="">Select a country</option>
                {countries.map((country) => (
                    <option key={country.name.common} value={country.name.common}>
                        {country.name.common}
                    </option>
                ))}
            </select>

            {loading && <p>Loading...</p>}

            {selectedCountry && !loading && (
                <div className="country-details">
                    <h2>{selectedCountry.name.common}</h2>
                    <div className="country-info">
                        <div className="flag-section">
                            <img
                                src={selectedCountry.flags.svg}
                                alt={selectedCountry.flags.alt || `Flag of ${selectedCountry.name.common}`}
                                style={{ width: '300px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div className="details-section">
                            <p><strong>Capital:</strong> {selectedCountry.capital?.[0] || 'N/A'}</p>
                            <p><strong>Currency:</strong> {
                                selectedCountry.currencies
                                    ? Object.values(selectedCountry.currencies)
                                        .map(curr => `${curr.name} (${curr.symbol})`)
                                        .join(', ')
                                    : 'N/A'
                            }</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default App