import React, {Component} from 'react'
import {connect} from 'react-redux'
import {map, reduce, filter, compose, path, pathOr, sortBy, prop, reverse, slice} from 'ramda'
import ChildButton from '../components/child-button'


const getChild = (id) => fetch('http://localhost:8080/children/' + id)
const getChildren = () => fetch('http://localhost:8080/children')
const getBadges = () => fetch('http://localhost:8080/badges')
const getParks = () => fetch('http://localhost:8080/parks')



class Child extends Component {
  componentDidMount() {
    if (this.props.match.params.id === 'undefined') {
      getChild(this.props.child._id)
        .then(res => res.json())
        .then(child => this.props.setChild(child))
    } else {
      getChild(this.props.match.params.id)
        .then(res => res.json())
        .then(child => this.props.setChild(child))
    }
    getChildren()
    .then(res => res.json())
    .then(children => this.props.setChildren(children))
    getBadges()
      .then(res => res.json())
      .then(badges => this.props.setBadges(badges))
    getParks()
      .then(res => res.json())
      .then(parks => this.props.setParks(parks))
  }


  render() {
    const props = this.props
    if (!path(['child', 'childName'], props)) {
      return (<div>
              <h2></h2>
            </div>)
    } else {
      const li = (badge) => {
        return ( <div key={badge.image}>
                  <img src={badge.image} alt={badge.alt} className='fl h3 w3 link overflow-hidden'></img>
                </div>) }

// return <li className="fl w-50 w-25-l link overflow-hidden"  key={child.childName}>{child.childName} - {reduce((acc, acts) => acc + acts.pointValue, 0, child.activities)} Parker points
//   <div role='img' style={{background: 'no-repeat center', backgroundSize: 'cover'}}></div>
// </a>

      const liActs = (acts) => {
        return  <li key={acts.body + props.child._id}>{acts.name}</li>
      }

  //find siblings of this child & then makes a button for each sibling
      const findSiblings = (child, sibs) => {
        return (filter(sib => (sib.familyId === child.familyId &&
                        sib.childName !== child.childName) === true, sibs))
      }

      const parkButton = (park, history) => {
        return <ChildButton label={park.parkName} key={park.parkName}
                             onClick={e => this.props.history.push('/parks/' + park._id)} />
      }

      const makeButton = (sib) => {
        return <ChildButton label={sib.childName} key={sib.childName}
                            onClick={e => this.props.setChild(sib)} />
      }

      const parkerPoints = reduce((acc, acts) => acc + acts.pointValue, 0, pathOr([], ['child', 'activities'], props))

      const fitnessPoints = compose(
        reduce((acc, acts) => acc + acts.pointValue, 0, ),
        filter(act => act.type === 'fitness')
      )(pathOr([], ['child', 'activities'], props))

      const scholarPoints = compose(
        reduce((acc, acts) => acc + acts.pointValue, 0, ),
        filter(act => act.type === 'learning')
      )(pathOr([], ['child', 'activities'], props))

      const samaritanPoints = compose(
        reduce((acc, acts) => acc + acts.pointValue, 0, ),
        filter(act => act.type === 'samaritan')
      )(pathOr([], ['child', 'activities'], props))


//pull children in family for Family Rank calc
        const familyChildren = (child, sibs) => {
        return compose(
          reverse(),
          sortBy(prop('totalPoints')),
          filter(sib => (sib.familyId === child.familyId) === true)
        )(sibs)
      }

      const highScore = (children) => {
        return compose(
          slice(0, 5, ),
          reverse(),
          sortBy(prop('totalPoints'))
        )(children)
      }

//pull all children for CPC Rank calc and order them by points
      const rankGroup = (child) => {
        return <li key={child.childName}>{child.childName} - {reduce((acc, acts) => acc + acts.pointValue, 0, child.activities)} Parker points</li>
      }

      return(
        <div className='ma2'>
          <ul className="list pl0 mt0 measure center">
            <li className="flex items-center lh-copy pa1 ph0-l bb b--black-10">
              <img  className='ba b--black-10 db br-100 w3 w3-ns h3 h3-ns'
            src='/parker-bear-orginal-painting.jpg' alt='Parker Bear on swing'></img>
            <div className="pl3 flex-auto">
            <span className="f4 db black-70">Hi {props.child.childName}!</span>
          </div>
          </li>
          </ul>
          <div className="dtc v-mid pl3">
        <h4>Welcome to your very own Parker home page!</h4>
        </div>

        <hr />
          <h3>{pathOr('', ['child', 'childName'], props)}s Park activities:</h3>
          <div className='pl2'>
          <h4>Activities completed:</h4>
            <ul>
              {map(liActs, pathOr([], ['child', 'activities'], props))}
            </ul>

          <div className='dt w-100 bb b--white-05 pb2 mt2'>
          <h4>Badges:</h4>
              {map(li, pathOr([], ['child', 'badges'], props))}
          </div>

          <h4>Parker points: {parkerPoints}  </h4>
          <ul>
            <li>Fitness points: {fitnessPoints}</li>
            <li>Scholar points: {scholarPoints}</li>
            <li>Volunteer points: {samaritanPoints}</li>
          </ul>
          <h4>Family Rank:</h4>
          <ol>
            {map(rankGroup, familyChildren(props.child, props.children))}
          </ol>
          <h4>High Score:</h4>
          <ol>
            {map(rankGroup, highScore(props.children))}
          </ol>
          <hr />
        </div>
        <div >
          {map(parkButton, props.parks, props.history)}
          {map(makeButton, findSiblings(props.child, props.children))}
        </div>
        </div>
      )
    }
  }
}


const mapStateToProps = (state) => ({
  family: state.family,
  children: state.children,
  child: state.child,
  badges: state.badges,
  parks: state.parks
})
const mapActionsToProps = (dispatch) => ({
  setChild: (child) => dispatch({type: 'SET_CHILD', payload: child}),
  setChildren: (children) => dispatch({type: 'SET_CHILDREN', payload: children}),
  setBadges: (badges) => dispatch({type: 'SET_BADGES', payload: badges}),
  setParks: (parks) => dispatch({type: 'SET_PARKS', payload: parks})
})
const connector = connect(mapStateToProps, mapActionsToProps)

export default connector(Child)
