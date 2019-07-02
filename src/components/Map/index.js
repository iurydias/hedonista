import React, { Component, Fragment } from "react";
import MapViewDirections from "react-native-maps-directions";
import { getDistanceFromLatLonInKm, getPixelSize } from "./utils";
import { View, Alert, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Search from "../Search";
import Directions from "../Directions";
import Details from "../Details";
import GoBack from "../GoBack";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as destinationActions from "../../actions/destination";
import * as durationActions from "../../actions/duration";
import * as distanceActions from "../../actions/distance";
import * as clickedActions from "../../actions/clicked";

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
    address: null
  };
  async componentDidMount() {
    this.watchId = navigator.geolocation.watchPosition(
      position => {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        this.setState({
          origin: {
            latitude,
            longitude,
            latitudeDelta: 0.0143,
            longitudeDelta: 0.0134
          },
          //region: {
          //latitude: position.coords.latitude,
          //longitude: position.coords.longitude,
          //latitudeDelta: 0.0143,
          //longitudeDelta: 0.0134
          //},
          //latitude: latitude,
          // longitude: longitude
        });
      },
      () => {
        Alert.alert("Erro", "Erro ao tentar atualizar localização");
      },
      {
        timeout: 3000,
        enableHighAccuracy: false
      }
    );
    await navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        this.setState({
          //origin: {
          //latitude,
          //longitude,
          //latitudeDelta: 0.0143,
          //longitudeDelta: 0.0134
          // },
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
      (erro) => {
        Alert.alert("Erro", "Erro ao tentar pegar localização " + JSON.stringify(erro));
        this.setState({ zoomEnabled: false });
      },
      {
        timeout: 3000,
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

    !this.props.destination &&
      this.props.actions.destinationActions.setDestination({ latitude: this.state.pointLocation.latitude, longitude: this.state.pointLocation.longitude });
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
      address
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
            }}
          >
            {this.props.destination && (
              <Fragment>
                <Directions
                  origin={origin}
                  destination={this.props.destination}
                  onReady={result => {
                    this.props.actions.durationActions.setDuration(Math.floor(result.duration));
                    this.props.actions.distanceActions.setDistance(result.distance.toFixed(2));
                    try {
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
                    }
                  }}
                />
              </Fragment>
            )}
            {this.props.markers.map(
              p =>
                getDistanceFromLatLonInKm(
                  p.latitude,
                  p.longitude,
                  latitude,
                  longitude
                ) < 20 && (
                  <Marker
                    tracksViewChanges={tracksViewChanges}
                    key={p.key}
                    coordinate={{
                      latitude: parseFloat(p.latitude),
                      longitude: parseFloat(p.longitude)
                    }}
                    onPress={() => {
                      p.hidden = false;
                      this.setState({
                        region: {
                          latitude: parseFloat(p.latitude),
                          longitude: parseFloat(p.longitude),
                          latitudeDelta: 0.0143,
                          longitudeDelta: 0.0134
                        },
                        pointLocation: {
                          latitude: parseFloat(p.latitude),
                          longitude: parseFloat(p.longitude)
                        },
                        title: p.name,
                        address: p.address
                      });
                      this.props.actions.clickedActions.setClicked(true);
                    }}
                  >
                    <Image
                      source={this.props.markerImg}
                      onLoad={this.stopRendering}
                    />
                  </Marker>
                )
            )}
          </MapView>
          {locationChanged &&
            <GoBack onPress={() => {
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
          {this.props.clicked ? (
            <Fragment>
              <MapViewDirections
                destination={pointLocation}
                origin={origin}
                onReady={result => {
                  this.props.actions.durationActions.setDuration(Math.floor(result.duration));
                  this.props.actions.distanceActions.setDistance(result.distance.toFixed(2));
                }}
                apikey="AIzaSyA-H7zGSuNzyCZDW5pPeegOgykilPgmMug"
              />
              {this.props.duration && (
                <Details
                  title={title}
                  address={address}
                  distance={this.props.distance}
                  duration={this.props.duration}
                  onDirectionButtonPress={this.onDirectionButtonPress}
                />
              )}
            </Fragment>
          ) : (
              origin &&
              <Search onLocationSelected={this.handleLocationSelected} />
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
  clicked: state.clicked,
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
        bindActionCreators(clickedActions, dispatch),
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);