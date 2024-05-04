Additional Features added
1. Add a “play” button to each of the ‘Description’ tabs 
    - Function: play and stop music after button is pressed
    - Methodology: 
        - toggleAudio Function
        - get the audio from artist.previewUrl
        - Initialize the status and elements for this index if they don't exist
    
2. Add a button "Song Names" after 'sort list of results by'
    - Function: displays all the song names returned by fetch grouped by collection name
    - Methodology:  
        - groupTracksByCollection and showTracksPopup functions
        - group the tracks based on their collection names
        - display the popup if button is clicked