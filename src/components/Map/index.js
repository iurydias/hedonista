import React, { Component, Fragment } from "react";
import MapViewDirections from "react-native-maps-directions";
import { getDistanceFromLatLonInKm, getPixelSize } from "./utils";
import { View, Alert, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import styles from "./styles";
import Directions from "../Directions";
import Details from "../Details";
import GoBack from "../GoBack";
import Add from "../Add";
import MapMarker from "../MapMarker";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as destinationActions from "../../actions/destination";
import * as durationActions from "../../actions/duration";
import * as distanceActions from "../../actions/distance";
import * as clickedActions from "../../actions/clicked";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import Icon from "react-native-vector-icons/FontAwesome5";

class Map extends Component {
  state = {
    origin: null,
    region: null,
    latitude: null,
    longitude: null,
    zoomEnabled: false,
    tracksViewChanges: true,
    pointLocation: null,
    locationChanged: false,
    title: null,
    address: null,
    searchFocused: false,
    directionsBuilt: false
  };
  async componentDidMount() {
    this.watchId = await navigator.geolocation.watchPosition(
      position => {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        this.setState({
          origin: {
            latitude,
            longitude,
            latitudeDelta: 0.0143,
            longitudeDelta: 0.0134
          }
        });
      },
      () => {
      },
      {
        maximumAge: 5000,
        enableHighAccuracy: false
      }
    );
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        this.setState({
          region: {
            latitude,
            longitude,
            latitudeDelta: 0.0143,
            longitudeDelta: 0.0134
          },
          latitude: latitude,
          longitude: longitude,
          zoomEnabled: true
        });
      },
      () => {
        Alert.alert("Erro", "Erro ao tentar pegar localização");
        this.setState({ zoomEnabled: false });
      },
      {
        timeout: 5000,
        enableHighAccuracy: false
      }
    );
  }
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }
  stopRendering = () => {
    this.setState({ tracksViewChanges: false });
  };
  onDirectionButtonPress = () => {
    if (!this.state.directionsBuilt) {
    this.props.actions.destinationActions.setDestination({ latitude: this.state.pointLocation.latitude, longitude: this.state.pointLocation.longitude });
    }
  };

  handleLocationSelected = (data, { geometry }) => {
    const {
      location: { lat: latitude, lng: longitude }
    } = geometry;
    this.setState({
      region: {
        latitude,
        longitude,
        latitudeDelta: 0.0143,
        longitudeDelta: 0.0134
      },
      latitude: latitude,
      longitude: longitude,
      locationChanged: true
    });
  };

  render() {
    const {
      origin,
      region,
      latitude,
      longitude,
      zoomEnabled,
      tracksViewChanges,
      pointLocation,
      locationChanged,
      title,
      address,
      searchFocused,
      directionsBuilt
    } = this.state;
    return (
      <Fragment>
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={region}
            showsUserLocation
            loadingEnabled
            showsMyLocationButton={false}
            zoomEnabled={zoomEnabled}
            toolbarEnabled={false}
            ref={el => (this.mapView = el)}
            onPress={() => {
              this.props.clicked &&
                this.props.actions.destinationActions.setDestination(null);
              this.props.actions.durationActions.setDuration(null);
              this.props.actions.distanceActions.setDistance(null);
              this.props.actions.clickedActions.setClicked(false);
              this.setState({ directionsBuilt: false })
            }}
          >
            {this.props.destination && (
              <Fragment>
                <Directions
                  origin={origin}
                  destination={this.props.destination}
                  onReady={result => {
                    //this.props.actions.durationActions.setDuration(Math.floor(result.duration));
                    //this.props.actions.distanceActions.setDistance(result.distance.toFixed(2));
                    
                      try {
                        this.setState({ directionsBuilt: true })
                        this.mapView.fitToCoordinates(result.coordinates, {
                          edgePadding: {
                            right: getPixelSize(50),
                            left: getPixelSize(50),
                            top: getPixelSize(250),
                            bottom: getPixelSize(50)
                          }
                        });
                      } catch (error) {
                        Alert.alert("Erro", "Erro ao tentar traçar a rota");
                        this.setState({ directionsBuilt: false })
                      }
                    }
                  }
                />
                <Marker
                  tracksViewChanges={tracksViewChanges}
                  coordinate={{
                    latitude: origin.latitude,
                    longitude: origin.longitude
                  }}
                >
                  <Icon name='child' size={30} color="#7049f9" />
                </Marker>
              </Fragment>
            )}
            {this.props.markers.map(
              p =>
                getDistanceFromLatLonInKm(
                  p.latitude,
                  p.longitude,
                  latitude,
                  longitude
                ) < 40 && (
                  <Marker
                    tracksViewChanges={tracksViewChanges}
                    key={p.id}
                    coordinate={{
                      latitude: p.latitude,
                      longitude: p.longitude
                    }}
                    onPress={() => {
                      this.props.actions.destinationActions.setDestination(null);
                      this.props.actions.distanceActions.setDistance(null);
                      this.props.actions.durationActions.setDuration(null);
                      this.setState({
                        region: {
                          latitude: p.latitude,
                          longitude: p.longitude,
                          latitudeDelta: 0.0143,
                          longitudeDelta: 0.0134
                        },
                        pointLocation: {
                          latitude: p.latitude,
                          longitude: p.longitude,
                          key: p.id,
                          author: p.author.name.charAt(0).toUpperCase() + p.author.name.slice(1) + " " + p.author.lastName.charAt(0).toUpperCase() + p.author.lastName.slice(1)
                        },
                        title: p.name,
                        address: p.address,
                        directionsBuilt: false
                      });
                      this.props.actions.clickedActions.setClicked(true);
                    }}
                  >
                    <MapMarker mounted={this.stopRendering} icon={this.props.icon} />
                  </Marker>

                )
            )}
          </MapView>
          {(locationChanged && !this.props.clicked) &&
            <GoBack onPress={() => {
              this.googlePlacesAutocomplete._handleChangeText('');
              this.setState({
                locationChanged: false,
                region: origin,
                latitude: origin.latitude,
                longitude: origin.longitude
              })
              this.props.clicked &&
                this.props.actions.destinationActions.setDestination(null);
              this.props.actions.durationActions.setDuration(null);
              this.props.actions.distanceActions.setDistance(null);
              this.props.actions.clickedActions.setClicked(false);
            }
            }
            />
          }
          {!locationChanged &&
            <View style={{ alignItems: 'flex-end', position: 'absolute', bottom: 0, right: 0, justifyContent: 'flex-end' }}>
              <Add onPress={() => {
                this.props.navigation.navigate('NewPoint', {
                  userId: this.props.userId,
                  subcategoryId: this.props.subcategoryId,
                  token: this.props.token,
                  origin: this.state.origin
                })
              }} />
            </View>
          }

          {this.props.clicked ? (
            <Fragment>
              <MapViewDirections
                destination={pointLocation}
                origin={origin}
                onReady={result => {
                  this.props.actions.distanceActions.setDistance(result.distance.toFixed(2));
                  this.props.actions.durationActions.setDuration(Math.floor(result.duration).toString());
                }}
                apikey="AIzaSyA-H7zGSuNzyCZDW5pPeegOgykilPgmMug"
              />
              {this.props.duration && (
                <Fragment>
                  <Details
                    title={title}
                    address={address}
                    distance={this.props.distance}
                    duration={this.props.duration}
                    onDirectionButtonPress={this.onDirectionButtonPress}
                    onPress={() => {
                      this.props.navigation.navigate('PointProfile',
                        {
                          latitude: this.state.pointLocation.latitude,
                          longitude: this.state.pointLocation.longitude,
                          duration: this.props.duration,
                          distance: this.props.distance,
                          title: title,
                          address: address,
                          navigationWithData: true,
                          pointId: this.state.pointLocation.key,
                          token: this.props.token,
                          icon: this.props.icon,
                          userId: this.props.userId,
                          author: this.state.pointLocation.author
                        })
                    }}
                  />
                </Fragment>
              )}
            </Fragment>
          ) : (
              origin &&
              <GooglePlacesAutocomplete
                placeholder="Mudar localização?"
                placeholderTextColor="#333"
                ref={c => this.googlePlacesAutocomplete = c}
                onPress={this.handleLocationSelected}
                query={{
                  key: "AIzaSyA-H7zGSuNzyCZDW5pPeegOgykilPgmMug",
                  language: "pt",
                  components: 'country:br'
                }}
                textInputProps={{
                  onFocus: () => { this.setState({ searchFocused: true }) },
                  onBlur: () => { this.setState({ searchFocused: false }) },
                  autoCapitalize: "none",
                  autoCorrect: false
                }}
                listViewDisplayed={searchFocused}
                fetchDetails
                enablePoweredByContainer={false}
                styles={styles}
              />
            )}
        </View>
      </Fragment>
    );
  }
}
const mapStateToProps = state => ({
  destination: state.destination,
  duration: state.duration,
  distance: state.distance,
  clicked: state.clicked
})

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      destinationActions:
        bindActionCreators(destinationActions, dispatch),
      durationActions:
        bindActionCreators(durationActions, dispatch),
      distanceActions:
        bindActionCreators(distanceActions, dispatch),
      clickedActions:
        bindActionCreators(clickedActions, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);