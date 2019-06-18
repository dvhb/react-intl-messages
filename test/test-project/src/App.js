import React, { Component } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

const messages = defineMessages({
  logInfo: { id: 'logInfo', defaultMessage: 'Log info', description: 'message in console' },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Eric',
      unreadCount: 1000,
    };
  }

  render() {
    const { name, unreadCount } = this.state;

    console.info(messages.logInfo);
    return (
      <p>
        <FormattedMessage
          id="welcome"
          defaultMessage={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
                      one {message}
                      other {messages}
                    }`}
          description="Welcome message"
          values={{ name: <b>{name}</b>, unreadCount }}
        />
      </p>
    );
  }
}

export default App;
