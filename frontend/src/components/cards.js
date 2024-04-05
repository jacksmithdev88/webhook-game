// Cards.js
import React from 'react';

const Cards = React.memo(({ cards }) => (
    <div id='cards' className="flex flex-1 flex-row m-auto w-full justify-center my-8">
        {cards.map((card, index) => (
            <div key={index} style={{
                border: '1px solid black',
                borderRadius: '10px',
                width: '100px',
                height: '150px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '10px',
                backgroundColor: 'white'
            }}>
                <p style={{margin: '0', padding: '10px', fontSize: '20px'}}>{card.value}</p>
                <p style={{margin: '0', padding: '10px', fontSize: '20px'}}>{card.suit}</p>
            </div>
        ))}
    </div>
));

export default Cards;