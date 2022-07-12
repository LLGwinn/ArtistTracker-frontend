import React, {useState, useCallback, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import ArtistTrackerApi from './api';
import userContext from './userContext';
import UnauthorizedMessage from "./UnauthorizedMessage";
import './AddArtistForm.css'

const _ = require('lodash');
const {debounce} = _;

function AddArtistForm( {add} ) {
    const [artistSearch, setArtistSearch] = useState("");
    const [autocompleteArtists, setAutocompleteArtists] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState({name:""});
    const [artistOptionsDisplay, setArtistOptionsDisplay] = useState(false);

    const {currUser, token} = useContext(userContext);
    const navigate = useNavigate();

    const debounceLoadArtists = useCallback(
        debounce(str => fetchArtists(str), 800), []);

    async function fetchArtists(str) {
        try {
            const res = await ArtistTrackerApi.getArtistsForAutocomplete(str);
            setAutocompleteArtists(res.artists);
        } catch(err) {
            console.log(err);
        }  
    }

    async function updateUserArtists(evt) {
        try {
            if (!selectedArtist.id) alert('Please select an artist.')
            else {add(selectedArtist.id, selectedArtist.name, currUser.id);
            navigate('/');}
        } catch(err) {
            console.log(err);
        }
    }

    const artistSearchChange = evt => {
        setArtistSearch(evt.target.value);
        if(artistSearch && artistSearch.length >= 2){
            debounceLoadArtists(evt.target.value);
        }
    }

    const setArtistSelection = (artistSelection) => {
        setArtistSearch(artistSelection.name);
        setSelectedArtist(artistSelection);
        setArtistOptionsDisplay(false);
    }

    if (!token) return <UnauthorizedMessage />;

    return (
        <div className='AddArtistForm container-fluid'>
            <div>
                <p className="display-5 mb-5 mt-4">Add an artist to your account:</p>
            </div>
            <Form autoComplete='off'>
                <Form.Group>
                    <Form.Label>Artist name:</Form.Label>
                    <Col sm={6} className="mx-auto">
                    <Form.Control id='artistSearch' 
                                  type='text' 
                                  name='selectedArtist' 
                                  onClick={() => setArtistOptionsDisplay(true)}
                                  onChange={artistSearchChange} 
                                  value={artistSearch} 
                                  required
                                  className='artistSearch mb-1' />
                    {artistOptionsDisplay && (
                        <div className='AddArtist-autocompleteContainer px-2 mt-1'>
                            {autocompleteArtists.length
                            ?
                            autocompleteArtists.map(artist => {
                                return (
                                    <div className='autocompleteOption' 
                                        key={artist.id} 
                                        onClick={() => setArtistSelection(artist)}>
                                        <span>{artist.name}</span>
                                    </div>
                                )
                            })
                            :
                            <p>Loading...</p>
                            }
                        </div>
                    )}
                    </Col>
                </Form.Group>
                <Button variant='dark'
                        className='mt-5'
                        onClick={updateUserArtists}>Add this artist to my favorites!</Button>
            </Form>
            <a className='btn btn-outline-dark col col-2 mt-5 mx-auto' href='/'>Home</a>
        </div>
    )

}

export default AddArtistForm;