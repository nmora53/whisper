// ***********************
// CUSTOM COMPONENT CODE
// src/components/YelpDataList.js
// ***********************

import React, { Component } from 'react';
import { withTaskContext } from '@twilio/flex-ui';

// CSS
const locationListStyles = {
  width: '100%',
  height: '20em',
  margin: '0 1em',
};

const locationItemStyle = {
  display: 'flex',
  margin: '1em 0',
  width: '100%',
};

const imgContainer = {
  height: '5em',
  width: '5em',
  overflow: 'auto',
  marginRight: '1em',
};

const imgStyle = {
  height: 'auto',
  width: '7em',
  marginLeft: '-1em',
};

const contentStyle = {
  display: 'flex',
  flexFlow: 'column',
  justifyContent: 'center',
  width: '100%',
};

const titleStyle = {
  fontWeight: '700',
  color: 'rgb(34, 34, 34',
  textDecoration: 'none',
  marginBottom: '.5em',
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
};

// React Component
class YelpDataList extends Component {
  constructor(props) {
    super(props);
    this.state = { businesses: [] };
  }

  // Build fetch request then fetch data when the component renders on the page
  componentDidMount() {
    // Set up the body of request
    const { task, token } = this.props;
    const body = {
      location: task
        ? task.attributes.caller_zip || task.attributes.caller_state
        : '94105',
      Token: token,
    };

    // Set up the HTTP options for your request
    const options = {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    };

    // Make the network request using the Fetch API
    fetch('https://flame-mole-7355.twil.io/yelp', options)
      .then(resp => resp.json())
      .then(data => {
        // Set component state to be businesses from current task
        this.setState({ businesses: data.businesses });
      });
  }
  render() {
    return (
      <ul style={locationListStyles}>
        {this.state.businesses.map(business => {
          return (
            <li style={locationItemStyle}>
              <div style={imgContainer}>
                <img
                  src={business.image_url}
                  alt={business.name}
                  style={imgStyle}
                />
              </div>
              <div style={contentStyle}>
                <a href={business.url} style={titleStyle} target="_blank">
                  {business.name}
                </a>
                <div style={rowStyle}>
                  <p>{business.location.address1}</p>
                  <p>{business.phone}</p>
                  <p>{business.is_closed ? 'Closed' : 'Open'}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default withTaskContext(YelpDataList);

