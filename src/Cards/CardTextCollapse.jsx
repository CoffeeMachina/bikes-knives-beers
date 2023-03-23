import React, {useState} from 'react';
import "./styles/CardTextCollapseBikes.css"

const CardTextCollapse = ({children, textSize, collapseThreshold=110}) => {
    const cardText = children;
    // const [textCountThreshold, setTextCountThreshold] = useState(cardText.length > 100);
    const textExpansionThreshold = children?.length > collapseThreshold;
    const [more, setMore] = useState(false);

    const textToggle = () => {
        setMore(prevState => !prevState);
    }


    return (
        <>
            {textExpansionThreshold ?
                <span>
                    {more ? cardText : cardText.substring(0, textSize)}

                    {more ? <button onClick={textToggle} style={{color: "mediumvioletred"}} className="button-collapse">...less</button>
                        :
                        <button onClick={textToggle} style={{color: "#3443eb"}} className="button-collapse">...more</button>}

        </span>

                : <span>{cardText}</span>}
        </>
    );
};

export default CardTextCollapse;