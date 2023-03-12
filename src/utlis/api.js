import axios from 'axios';

const { VITE_URL } = import.meta.env;

export const apiCityData = () => axios.get(VITE_URL);

export default {};
