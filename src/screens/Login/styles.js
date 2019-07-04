import { StyleSheet,Dimensions } from "react-native";

const {width: WIDTH} = Dimensions.get('window')
const styles = StyleSheet.create({
  Container:{
    backgroundColor: '#603DEB',
    height: '100%',
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer:{
    width: WIDTH - 55,
    backgroundColor: '#EEE',
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    flexWrap: 'wrap',
    flexDirection: 'row',
    margin: 15
    },
  emailInput:{
    fontFamily: "MyriadPro",
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    paddingLeft: 20
  },
  passInput:{
    fontFamily: "MyriadPro",
    width: '80%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 10,
    paddingLeft: 20
  },
  inputIcon:{
    width: '10%',
    justifyContent: "center",
    alignItems: "center",
  },
  logo:{
    fontFamily: "MyriadPro",
    fontSize: 30,
    color: '#FFF'
  },
  logoContainer:{
    marginBottom: 20
  },
  Button:{
    backgroundColor: '#FFF',
    borderRadius: 40,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  btnTxt:{
    fontFamily: "MyriadPro",
    fontSize: 15,
    color: '#603DEB'
  },
  bottomContainer:{
    flexDirection: 'row',
    width: WIDTH - 55,
    marginTop: 15
  },
  createAccountTxt:{
    fontFamily: "MyriadPro",
    fontSize: 15,
    color: '#FFF',
    padding: 10,
    opacity: 0.7
  },
  buttonContainer:{
    width: '50%',
  },
  createAccountContainer:{
    width: '50%',
    height: 45,
    flexWrap: 'wrap',
    justifyContent: "center",
    alignItems: "flex-end",
  },
  eyeBtn:{
    backgroundColor: '#FFF',
    width: '10%',
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingRight: 10
  }
});

export default styles;