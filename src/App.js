import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import NoiseBackground from "./NoiseBackground";
import NoiseBar from "./NoiseBar";
import './App.css';
export default function App() {

    const [score, setScore] = useState({
        reactor: 0,
        thruster: 0,
        shield: 0,
        damage: 0
    });
    
    const [rotateReset, setRotateReset] = useState(false);

    return (
        <div id="app">
            <NoiseBackground opacity={0.08} scale={2} fps={20} />

            <div id="title">
                <img src={`${process.env.PUBLIC_URL}/images/title-text.PNG`} alt="Logo" id="logo-image" />
            </div>
            <div id="score-tracker">
                <div className="symbol-container" id="reactor">
                    <img src={`${process.env.PUBLIC_URL}/images/reactor.png`} alt="Symbol" className="symbol reactor" />
                    <div className="score-item">
                        <FontAwesomeIcon icon={faMinus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, reactor: Math.max(0, score.reactor - 1) })} />
                        <span id="reactor-score" className="score-value" style={ score.reactor === 0 ? { opacity: 0.3 } : null }>{score.reactor}</span>
                        <FontAwesomeIcon icon={faPlus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, reactor: score.reactor + 1 })} />
                    </div>
                </div>
                <div className="symbol-container" id="thruster">
                    <img src={`${process.env.PUBLIC_URL}/images/thruster.png`} alt="Symbol" className="symbol thruster" />
                    <div className="score-item">
                        <FontAwesomeIcon icon={faMinus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, thruster: Math.max(0, score.thruster - 1) })} />
                        <span id="thruster-score" className="score-value" style={ score.thruster === 0 ? { opacity: 0.3 } : null }>{score.thruster}</span>
                        <FontAwesomeIcon icon={faPlus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, thruster: score.thruster + 1 })} />
                    </div>
                </div>
                <div className="symbol-container" id="shield">
                    <img src={`${process.env.PUBLIC_URL}/images/shield.png`} alt="Symbol" className="symbol shield" />
                    <div className="score-item">
                        <FontAwesomeIcon icon={faMinus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, shield: Math.max(0, score.shield - 1) })} />
                        <span id="shield-score" className="score-value" style={ score.shield === 0 ? { opacity: 0.3 } : null }>{score.shield}</span>
                        <FontAwesomeIcon icon={faPlus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, shield: score.shield + 1 })} />
                    </div>
                </div>
                <div className="symbol-container" id="damage">
                    <img src={`${process.env.PUBLIC_URL}/images/damage.png`} alt="Symbol" className="symbol damage" />
                    <div className="score-item">
                        <FontAwesomeIcon icon={faMinus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, damage: Math.max(0, score.damage - 1) })} />
                        <span id="damage-score" className="score-value" style={ score.damage === 0 ? { opacity: 0.3 } : null }>{score.damage}</span>
                        <FontAwesomeIcon icon={faPlus} className="score-button" style={{ fontSize: '21px', color: '#999' }} onClick={() => setScore({ ...score, damage: score.damage + 1 })} />
                    </div>
                </div>
            </div>
            <div id="reset">
                <FontAwesomeIcon icon={faRotateRight} size="3x" className={ rotateReset ? 'rotate-reset' : '' }
                    onClick={
                        () => {
                            setRotateReset(true);
                            setTimeout(() => {
                                setScore({
                                    reactor: 0,
                                    thruster: 0,
                                    shield: 0,
                                    damage: 0
                                });

                                setRotateReset(false);
                            }, 500);
                        }
                    }
                />
            </div>
        </div>
    );
}