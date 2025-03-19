import {useEffect, useState } from 'react'
import './App.css'
import Search from './components/Search'
import {getTrendingMovies, updateSearchCount} from './appwrite' // import { use } from 'react';

import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {useDebounce} from 'react-use'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIOPNS ={
  method:'GET',
  headers:{
 accept:'application/json',
 Authorization :`Bearer ${API_KEY}`

  }
}
function App() {
  const [SearchTerm ,setSearchTerm]=useState('');
  const [errormessage,setErrormessage]=useState('');
  const [movielist,setMovielist]=useState([]);
  const[isLoding,setIsLoding]=useState(false);
  const[trendingMovies,setTrendingMovies]=useState([])
  const[debounceSearchTerm,setDebounceSearchTerm]=useState('');
  useDebounce(()=>setDebounceSearchTerm(SearchTerm),2500,[SearchTerm])
 

  const fetchMovies =async( query = '')=> {
     setIsLoding(true);
     setErrormessage('');
    try {
      const endpoint = query
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

       const response =await fetch(endpoint,API_OPTIOPNS);

     if (!response.ok){
      throw new Error ('Failed  to featch movies ')
     }
      

      const data =await response.json();
      console.log(data)
      if(data.Response === false){

        setErrormessage(data.Error || 'Failed to fetch movies');
        setMovielist([]);
        return;

      }
      setMovielist(data.results||[ ]);
     if (query && data.results.length >0)
      {
        await updateSearchCount(query,data.results[0])


     }

    } catch (error) {
      console.error(`Error fetching movies: ${error} `)
      setErrormessage('Error fetching movie please try agiang ')
   
    }
    finally{
      setIsLoding(false)
    }
  }

  const loadTrendingMovies =async()=>{

    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
      
    } catch (error) 
    {
      console.log(error)
      
    }
  }
 useEffect(()=>{

  fetchMovies(debounceSearchTerm);


 },[debounceSearchTerm])

 useEffect(
  ()=>{
    loadTrendingMovies();
  },[]
 )
 
  return (
  <>
  <main>
    <div className='pattern' />
    <div className='wrapper'>
      <header>
        <img src="./hero.png" />
      <h1>
        Find <span className='text-gradient'>Movies</span> you'll enjoy Without the assles
      </h1>
      </header>
 <Search  SearchTerm={SearchTerm}  setSearchTerm={setSearchTerm} />
     

     {trendingMovies.length >0 &&(
      <section className='trending' >
        <h2> Trending Movies </h2>
        <ul>
          {trendingMovies.map((movie,index)=>(
            <li key={movie.$id}>
              <p>{index+1}</p>
              <img src={movie.poster_url} alt={movie.title} />
            </li>
          ))}
        </ul>


      </section>
     )

     }
   
   <section className='all-movies'>
    <h2 > All Movies</h2>
    {isLoding? (<Spinner/>):errormessage?(<p className='text-red-500'>
      {errormessage}
    </p>):<ul>
 {movielist.map((movie)=>(
 <MovieCard key={movie.id} movie={movie}/>
 ))}
    </ul>
    
    }

{errormessage && <p className='text-red-500'> {errormessage}</p>}
   </section>
    </div>
   
  </main>
  </>
  )
}

export default App
