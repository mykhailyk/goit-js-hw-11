import axios from 'axios';

export default async function fetchPixabay(data, page) {
  const base_url = 'https://pixabay.com/api/';
  const key = '30653441-f63e96a9a352c6563528424cd';
  const options = `key=${key}&q=${data}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;

  return await axios.get(`${base_url}?${options}`).then(res => res.data);
}
