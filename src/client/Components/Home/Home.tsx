import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../Store/hooks';
import { storeClusterDbData } from '../../Store/actions';
import NavBar from './NavBar';
import Kube from '../Cards/Kube';
import { Get } from '../../Services';
import { apiRoute } from '../../utils';
import { IReducers } from '../../Interfaces/IReducers';
import './styles.css';
import { ClusterTypes } from '../../Interfaces/ICluster';
import { setDarkMode } from '../../Store/actions';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import { fetchClusters } from '../../Queries';

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const uiReducer = useAppSelector((state: IReducers) => state.uiReducer);
  const [noClusterError, setNoClusterError] = useState('');
  const [clustersArray, setClustersArray] = useState<ClusterTypes[]>([]);
  const darkMode = uiReducer.clusterUIState.darkmode;
  const [visited, setVisited] = useState(false);
  const { data } = useQuery({
    queryKey: ['cluster'],
    queryFn: fetchClusters,
  });

  useEffect(() => {
    // console.log(data, 'DATA FROM REACT QUERY');
    if (data?.invalid) return navigate('/');
    if (data?.message) {
      setNoClusterError(
        'Please add cluster information in administrator portal'
      );
      return;
    }
    dispatch(storeClusterDbData(data));
    // console.log(data, 'jjjdkkdkdkkdk');
    setClustersArray(data);
  }, [data, dispatch, navigate]);

  //* Added to load darkmode state when navigating to home, (was just at admin load) -mcm
  useEffect(() => {
    const getUserInfo = async () => {
      const user = await Get(apiRoute.getRoute(`user`));
      if (user.invalid) {
        return navigate('/');
      }
      dispatch(setDarkMode(user.darkMode));
      user.darkMode
        ? (document.body.style.backgroundColor = '#34363b')
        : (document.body.style.backgroundColor = '#3a4a5b');
    };
    getUserInfo();
  }, [darkMode, dispatch, navigate]);

  function renderSplash() {
    if (!visited) {
      setVisited(true);
    }
  }

  return (
    <Container id="HomeContainer">
      <NavBar />
      <Container id="HeaderContainer">
        <div id="Header-Bar-Title">CLUSTERS</div>
        <div id="Sort-Button">SORT</div>
      </Container>
      <div className="Kube-port">
        <div className="Kube-container" id="Kube-container">
          {clustersArray?.length &&
            clustersArray?.map((cluster, index) => (
              <Kube
                isDark={darkMode} //*adding for darkmode
                key={index}
                _id={cluster._id}
                favorite={cluster.favorite}
                favoriteStatus={true}
              />
            ))}
        </div>
        {noClusterError}
      </div>
    </Container>
  );
};

export default Home;
