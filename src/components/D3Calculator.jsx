import React, { useState, useRef } from 'react';

export default function D3Calculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [lagna, setLagna] = useState({ rasi: '', degree: '' });
  const [planetPositions, setPlanetPositions] = useState({});
  const [d1Chart, setD1Chart] = useState([]);
  const [d3Chart, setD3Chart] = useState([]);
  const [analysisData, setAnalysisData] = useState([]);
  const reportRef = useRef(null);

  const planets = [
    { id: 'sun', name: 'சூரியன்' },
    { id: 'moon', name: 'சந்திரன்' },
    { id: 'mars', name: 'செவ்வாய்' },
    { id: 'mercury', name: 'புதன்' },
    { id: 'jupiter', name: 'குரு' },
    { id: 'venus', name: 'சுக்ரன்' },
    { id: 'saturn', name: 'சனி' },
    { id: 'rahu', name: 'ராகு' },
    { id: 'ketu', name: 'கேது' }
  ];

  const rasiNames = {
    1: 'மேஷம்',
    2: 'ரிஷபம்',
    3: 'மிதுனம்',
    4: 'கடகம்',
    5: 'சிம்மம்',
    6: 'கன்னி',
    7: 'துலாம்',
    8: 'விருச்சிகம்',
    9: 'தனுசு',
    10: 'மகரம்',
    11: 'கும்பம்',
    12: 'மீனம்'
  };

  // Generate arrays for dropdown options
  const rasiOptions = [
    { value: '', label: '-- தேர்ந்தெடுக்கவும் --' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: rasiNames[i + 1] }))
  ];
  
  const degreeOptions = [
    { value: '', label: '-- தேர்ந்தெடுக்கவும் --' },
    ...Array.from({ length: 30 }, (_, i) => ({ value: (i + 1).toString(), label: `${i + 1}°` }))
  ];

  // Body parts mapping for each rasi based on drekkana
  const bodyPartsByRasi = {
    1: { // Aries body parts
      first: 'தலை',
      second: 'இடது மார்பு',
      third: 'வலது முழங்கால்'
    },
    2: { // Taurus body parts
      first: 'வலது கண்',
      second: 'இடது விலா',
      third: 'வலது கண்ணுக்கால'
    },
    3: { // Gemini body parts
      first: 'வலது காது',
      second: 'இடது கை',
      third: 'பாதம்'// changed
    },
    4: { // Cancer body parts
      first: 'வலது நாசி',
      second: 'இடது தோள்ப்பட்டை',
      third: 'இடது கண்ணுக்கால' //changed
    },
    5: { // Leo body parts
      first: 'வலது கன்னம்',
      second: 'கழுத்து', // changed
      third: 'இடது முழங்கால்' 
      
    },
    6: { // Virgo body parts
      first: 'வலது தாடை',
      second: 'வலது தோள்பட்டை', //changed
      third: 'இடது தொடை'
    },
    7: { // Libra body parts
      first: 'முகம்',
      second: 'வலது கை', //changed
      third: 'இடது விறைப்பை' //changed
    },
    8: { // Scorpio body parts
      first: 'இடது தாடை',
      second: 'வலது விலா', // changed
      third: ' இடது பக்க இனப்பெருக்க உறுப்பு' // changed
    },
    9: { // Sagittarius body parts
      first: 'இடது கன்னம்',
      second:'வலது மார்பு', // changed
      third: 'இனப்பெருக்க உறுப்பு மேல் பகுதி' //changed
    },
    10: { // Capricorn body parts
      first: 'இடது நாசி',
      second: 'வலது பக்க வயிறு', // changed
      third: 'வலது பக்க இனப்பெருக்க உறுப்பு'
    },
    11: { // Aquarius body parts
      first: 'இடது காது',
      second: 'தொப்புள்', // changed
      third: 'வலது விரைப்பை'
    },
    12: { // Pisces body parts
      first: 'இடது கண்',
      second: 'இடது பக்க வயிறு',
      third: 'வலது தொடை'
    }
  };

  const getDrekkanaSection = (degree) => {
    const deg = parseFloat(degree);
    if (deg <= 10) return 'first';
    if (deg <= 20) return 'second';
    return 'third';
  };

  const getDrekkanaSectionName = (section) => {
    switch(section) {
      case 'first': return 'முதல் திரேக்கானம் (0-10)';
      case 'second': return 'இரண்டாம் திரேக்கானம் (10-20)';
      case 'third': return 'மூன்றாம் திரேக்கானம் (20-30)';
      default: return '';
    }
  };

  const calculateD3Rasi = (rasi, degree) => {
    const section = getDrekkanaSection(degree);
    const baseRasi = parseInt(rasi);
    if (section === 'first') return baseRasi;
    if (section === 'second') return ((baseRasi + 4 - 1) % 12) + 1;
    return ((baseRasi + 8 - 1) % 12) + 1;
  };

  const handlePlanetChange = (planetId, field, value) => {
    setPlanetPositions(prev => ({
      ...prev,
      [planetId]: {
        ...prev[planetId],
        [field]: value
      }
    }));
  };

  // Function to get body part based on D3 house position and degree
  const getBodyPartByD3House = (d3House, degree) => {
    // Calculate corresponding rasi for body part mapping (1-12)
    // D3 House 1 maps to Aries body parts, House 2 to Taurus, etc.
    const bodyPartRasi = ((d3House - 1) % 12) + 1;
    const section = getDrekkanaSection(degree);
    
    return bodyPartsByRasi[bodyPartRasi][section];
  };

  const calculateCharts = () => {
    if (!lagna.rasi || !lagna.degree) {
      alert('லக்ன விவரங்களை உள்ளிடவும்');
      return;
    }

    const lagnaRasi = parseInt(lagna.rasi);
    const lagnaSection = getDrekkanaSection(lagna.degree);
    const lagnaD3Rasi = calculateD3Rasi(lagnaRasi, lagna.degree);

    const newD1Chart = Array(12).fill(null).map(() => ({
      planets: []
    }));

    const newD3Chart = Array(12).fill(null).map(() => ({
      planets: []
    }));

    newD1Chart[lagnaRasi - 1] = {
      house: 1,
      planets: [{ id: 'lagnam', name: 'லக்னம்', degree: lagna.degree }]
    };

    newD3Chart[lagnaD3Rasi - 1] = {
      house: 1,
      planets: [{ id: 'lagnam', name: 'லக்னம்', degree: lagna.degree }]
    };

    const newAnalysisData = [{
      planetName: 'லக்னம்',
      d1Rasi: lagnaRasi,
      d1House: 1,
      d1Degree: parseFloat(lagna.degree),
      section: lagnaSection,
      sectionName: getDrekkanaSectionName(lagnaSection),
      d3Rasi: lagnaD3Rasi,
      d3House: 1,
      bodyPart: getBodyPartByD3House(1, lagna.degree) // House 1 for Lagna
    }];

    Object.entries(planetPositions).forEach(([planetId, position]) => {
      if (!position?.rasi || !position?.degree) return;

      const d1Rasi = parseInt(position.rasi);
      const degree = parseFloat(position.degree);
      const section = getDrekkanaSection(degree);
      const d3Rasi = calculateD3Rasi(d1Rasi, degree);
      const planet = planets.find(p => p.id === planetId);

      if (planet) {
        if (!newD1Chart[d1Rasi - 1].planets) {
          newD1Chart[d1Rasi - 1] = { planets: [] };
        }
        newD1Chart[d1Rasi - 1].planets.push({
          id: planetId,
          name: planet.name,
          degree: degree
        });

        if (!newD3Chart[d3Rasi - 1].planets) {
          newD3Chart[d3Rasi - 1] = { planets: [] };
        }
        newD3Chart[d3Rasi - 1].planets.push({
          id: planetId,
          name: planet.name,
          degree: degree
        });

        const d1House = ((d1Rasi - lagnaRasi + 12) % 12) + 1;
        const d3House = ((d3Rasi - lagnaD3Rasi + 12) % 12) + 1;
        
        newAnalysisData.push({
          planetName: planet.name,
          d1Rasi: d1Rasi,
          d1House: d1House,
          d1Degree: degree,
          section: section,
          sectionName: getDrekkanaSectionName(section),
          d3Rasi: d3Rasi,
          d3House: d3House,
          bodyPart: getBodyPartByD3House(d3House, degree)
        });
      }
    });

    newD1Chart.forEach((house, index) => {
      house.house = ((index + 1 - lagnaRasi + 12) % 12) + 1;
    });

    newD3Chart.forEach((house, index) => {
      house.house = ((index + 1 - lagnaD3Rasi + 12) % 12) + 1;
    });

    setD1Chart(newD1Chart);
    setD3Chart(newD3Chart);
    setAnalysisData(newAnalysisData);
    setCurrentStep(2);
  };

  const exportToWord = () => {
    // Create chart HTML representation for Word export
    const createChartHtml = (chart, title) => {
      let html = `
        <h2>${title}</h2>
        <table style="width:100%; border-collapse: collapse; border: 2px solid #ccc;">
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[12]}</b>${chart[11]?.house ? ` (H${chart[11].house})` : ''}</div>
              ${chart[11]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[1]}</b>${chart[0]?.house ? ` (H${chart[0].house})` : ''}</div>
              ${chart[0]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[2]}</b>${chart[1]?.house ? ` (H${chart[1].house})` : ''}</div>
              ${chart[1]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[3]}</b>${chart[2]?.house ? ` (H${chart[2].house})` : ''}</div>
              ${chart[2]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[11]}</b>${chart[10]?.house ? ` (H${chart[10].house})` : ''}</div>
              ${chart[10]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td colspan="2" style="background-color: #f5f5f5; text-align: center; vertical-align: middle; border: 1px solid #ccc;">
              <div style="font-size: 16px; font-weight: bold;">${title}</div>
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[4]}</b>${chart[3]?.house ? ` (H${chart[3].house})` : ''}</div>
              ${chart[3]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[10]}</b>${chart[9]?.house ? ` (H${chart[9].house})` : ''}</div>
              ${chart[9]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td colspan="2" style="background-color: #f5f5f5; border: 1px solid #ccc;">
              &nbsp;
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[5]}</b>${chart[4]?.house ? ` (H${chart[4].house})` : ''}</div>
              ${chart[4]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[9]}</b>${chart[8]?.house ? ` (H${chart[8].house})` : ''}</div>
              ${chart[8]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[8]}</b>${chart[7]?.house ? ` (H${chart[7].house})` : ''}</div>
              ${chart[7]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[7]}</b>${chart[6]?.house ? ` (H${chart[6].house})` : ''}</div>
              ${chart[6]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              <div><b>${rasiNames[6]}</b>${chart[5]?.house ? ` (H${chart[5].house})` : ''}</div>
              ${chart[5]?.planets?.map(p => `<div>${p.name} ${p.degree}°</div>`).join('') || ''}
            </td>
          </tr>
        </table>
        <br/>
      `;
      return html;
    };

    // Create HTML content
    let htmlContent = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>திரேக்கானம் கணக்கீடு அறிக்கை</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1, h2 { color: #333; }
        </style>
      </head>
      <body>
        <h1>திரேக்கானம் கணக்கீடு அறிக்கை</h1>
        <p>நாள்: ${new Date().toLocaleDateString()}</p>
        
        ${createChartHtml(d1Chart, 'D1 ஜாதகம்')}
        ${createChartHtml(d3Chart, 'D3 ஜாதகம்')}
        
        <h2>விரிவான பகுப்பாய்வு</h2>
        <table>
          <thead>
            <tr>
              <th>கிரகம்</th>
              <th>D1 ராசி</th>
              <th>D1 பாவம்</th>
              <th>டிகிரி</th>
              <th>திரேக்கானம்</th>
              <th>D3 ராசி</th>
              <th>D3 பாவம்</th>
              <th>உடல் பகுதி</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add rows
    analysisData.forEach(data => {
      htmlContent += `
        <tr>
          <td>${data.planetName}</td>
          <td>${rasiNames[data.d1Rasi]}</td>
          <td>${data.d1House}</td>
          <td>${data.d1Degree}°</td>
          <td>${data.sectionName}</td>
          <td>${rasiNames[data.d3Rasi]}</td>
          <td>${data.d3House}</td>
          <td>${data.bodyPart}</td>
        </tr>
      `;
    });
    
    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // Create Blob and download
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'drekkana-report.doc';
    link.click();
  };

  const ChartHouse = ({ house, rasi }) => (
    <div style={{ border: '1px solid #ccc', padding: '8px', height: '96px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
        {rasiNames[rasi]} {house?.house && `(H${house.house})`}
      </div>
      <div style={{ fontSize: '12px', marginTop: '4px' }}>
        {house?.planets?.map(planet => (
          <div key={planet.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {planet.name} {planet.degree}°
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = (chart, title) => (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>{title}</h3>
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, auto)', border: '2px solid #ccc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <ChartHouse house={chart[11]} rasi={12} />
            <ChartHouse house={chart[0]} rasi={1} />
            <ChartHouse house={chart[1]} rasi={2} />
            <ChartHouse house={chart[2]} rasi={3} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <ChartHouse house={chart[10]} rasi={11} />
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</span>
            </div>
            <ChartHouse house={chart[3]} rasi={4} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <ChartHouse house={chart[9]} rasi={10} />
            <div style={{ gridColumn: 'span 2', backgroundColor: '#f5f5f5' }} />
            <ChartHouse house={chart[4]} rasi={5} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <ChartHouse house={chart[8]} rasi={9} />
            <ChartHouse house={chart[7]} rasi={8} />
            <ChartHouse house={chart[6]} rasi={7} />
            <ChartHouse house={chart[5]} rasi={6} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisTable = () => (
    <div style={{ marginTop: '32px', overflowX: 'auto' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>விரிவான பகுப்பாய்வு</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f5f5f5' }}>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>கிரகம்</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>D1 ராசி</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>D1 பாவம்</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>டிகிரி</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>திரேக்கானம்</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>D3 ராசி</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>D3 பாவம்</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>உடல் பகுதி</th>
          </tr>
        </thead>
        <tbody>
          {analysisData.map((data, index) => (
            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{data.planetName}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{rasiNames[data.d1Rasi]}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{data.d1House}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{data.d1Degree}°</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{data.sectionName}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{rasiNames[data.d3Rasi]}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{data.d3House}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{data.bodyPart}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInputForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label htmlFor="lagnaRasi" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>லக்ன ராசி</label>
        <select
          id="lagnaRasi"
          value={lagna.rasi}
          onChange={(e) => setLagna({ ...lagna, rasi: e.target.value })}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          {rasiOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="lagnaDegree" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>லக்ன டிகிரி</label>
        <select
          id="lagnaDegree"
          value={lagna.degree}
          onChange={(e) => setLagna({ ...lagna, degree: e.target.value })}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          {degreeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {planets.map((planet) => (
        <div key={planet.id} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f5f5f5' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{planet.name}</h3>
          <div style={{ marginBottom: '8px' }}>
            <label htmlFor={`${planet.id}Rasi`} style={{ display: 'block', marginBottom: '4px' }}>ராசி</label>
            <select
              id={`${planet.id}Rasi`}
              value={planetPositions[planet.id]?.rasi || ''}
              onChange={(e) => handlePlanetChange(planet.id, 'rasi', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              {rasiOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${planet.id}Degree`} style={{ display: 'block', marginBottom: '4px' }}>டிகிரி</label>
            <select
              id={`${planet.id}Degree`}
              value={planetPositions[planet.id]?.degree || ''}
              onChange={(e) => handlePlanetChange(planet.id, 'degree', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              {degreeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <button 
        onClick={calculateCharts} 
        style={{ 
          marginTop: '24px', 
          padding: '12px', 
          backgroundColor: '#4f46e5', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        கணக்கிடவும்
      </button>
    </div>
  );

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>திரேக்கானம் கணக்கீடு</h1>
      </div>
      
      {currentStep === 1 && renderInputForm()}
      
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} ref={reportRef}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
            <button 
              onClick={exportToWord}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⬇️</span> Word பதிவிறக்கம்
            </button>
          </div>
          
          {renderChart(d1Chart, 'D1 ஜாதகம்')}
          {renderChart(d3Chart, 'D3 ஜாதகம்')}
          {renderAnalysisTable()}
          
          <button 
            onClick={() => setCurrentStep(1)}
            style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer'
            }}
          >
            மீண்டும் கணக்கிடவும்
          </button>
        </div>
      )}
    </div>
  );
}