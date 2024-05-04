const { createApp } = Vue

createApp({
  data() {
    return {
      userQuery: '',
      artists: [],
      activeTabs: {},
      genres: [],
      chosenGenres: [],
      artistDisplay: [],
      chosenSort: 'original',
      audioElements: {},
      audioStatus: {},
      showPopup: false,
      groupedTracks: {}
    }
  },
  methods: {
    getArtist() {
      if (this.userQuery.trim() === '') {
        alert('Please enter a keyword to search artists.');
        return;
      }

      const searchTerm = encodeURIComponent(this.userQuery.trim());
      const url = `https://itunes.apple.com/search?term=${searchTerm}&limit=50`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(json => {
          console.log(json);
          if (json.resultCount === 0) {
            alert(`No artists found for "${this.userQuery}".`);
            return;
          }
          this.artists = json.results.map(artist => {
            if (!artist.trackPrice || artist.trackPrice < 0) {
              artist.trackPrice = 0; // Set trackPrice to 0 if it is empty or less than 0
            }
            return artist;
          }).filter(item =>
            item.artistName?.toLowerCase().includes(this.userQuery.trim().toLowerCase()) ||
            item.collectionName?.toLowerCase().includes(this.userQuery.trim().toLowerCase()) 
            // item.trackName?.toLowerCase().includes(this.userQuery.trim().toLowerCase())
          );
          this.artistDisplay = this.artists;
          // Extract all genres from the artists
          const allGenres = this.artists.map(({ primaryGenreName }) => primaryGenreName);
          // Filter out unique genres and update the genres data property
          this.genres = [...new Set(allGenres)];
          this.chosenSort = 'original';
          this.chosenGenres = [];
          this.created();
        })
        .catch(error => {
          console.error('There was a problem with fetching the artist data:', error);
        });
    }, 
    displayAllArtists() {
      this.chosenGenres = [];
      this.artistDisplay = this.artists;
      this.sort(this.chosenSort);
    },
    displayGenreArtists(genre) {
      const genreIndex = this.chosenGenres.indexOf(genre);
      if (genreIndex === -1) {
        // If the genre is not already selected, add it to the chosenGenres array
        this.chosenGenres.push(genre);
        this.sort(this.chosenSort);
      } else {
        // If the genre is already selected, remove it from the chosenGenres array
        this.chosenGenres.splice(genreIndex, 1);
        this.sort(this.chosenSort);
      }
    },
    updateArtists() {
      let filteredArtists = this.artists.filter(artist => 
        this.chosenGenres.length === 0 || this.chosenGenres.includes(artist.primaryGenreName)
      );
    
      this.artistDisplay = this.sortArtists(filteredArtists, this.chosenSort);
    },
    sortArtists(artists, sortOption) {
      if (sortOption === 'collectionName') {
        return artists.slice().sort((a, b) => a.collectionName.localeCompare(b.collectionName));
      } else if (sortOption === 'price') {
        return artists.slice().sort((a, b) => a.trackPrice - b.trackPrice);
      }
      // If 'original', just return the artists as they were.
      return artists;
    },
    sort(sortOption){
      this.chosenSort = sortOption;
      this.updateArtists();
    },
    created() {
      // Set the default active tab to 'description' for each artist
      this.artists.forEach((artist, index) => {
        this.activeTabs[index] = 'description'; 
      });
    },
    setActiveTab(index, tabName) {
      // Update the active tab for the specific track
      this.activeTabs[index] = tabName;
    },
    isActiveTab(index, tabName) {
      // Check if the given tab is active for the specific track
      return this.activeTabs[index] === tabName;
    },
    toggleAudio(artist, index) {
      const indexKey = String(index);
    
      // Initialize the status and elements for this index if they don't exist
      this.audioStatus[indexKey] = this.audioStatus[indexKey] || false;
      this.audioElements[indexKey] = this.audioElements[indexKey] || new Audio(artist.previewUrl);
    
      if (this.audioStatus[indexKey]) {
        this.audioElements[indexKey].pause();
        this.audioElements[indexKey].currentTime = 0; 
        this.audioStatus[indexKey] = false;
      } else {
        // Stop all other tracks before playing the new one
        Object.keys(this.audioElements).forEach(key => {
          if (this.audioElements[key] && key !== indexKey) {
            this.audioElements[key].pause();
            this.audioElements[key].currentTime = 0; 
            this.audioStatus[key] = false;
          }
        });
        this.audioElements[indexKey].play();
        this.audioStatus[indexKey] = true;
      }
    },
    groupTracksByCollection() {
      this.groupedTracks = this.artists.reduce((acc, artist) => {
        if (acc[artist.collectionName]) {
          acc[artist.collectionName].push(artist);
        } else {
          acc[artist.collectionName] = [artist];
        }
        return acc;
      }, {});
    },
    showTracksPopup() {
      this.groupTracksByCollection();
      this.showPopup = true;
    }
  }
}).mount('#app')
