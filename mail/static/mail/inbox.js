document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send email event listener
  document.querySelector('#compose-form').addEventListener('submit', send_email)

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email(event) {

    console.log('ENTERED SEND EMAIL METHOD');
    
    // Prevent automatic reload of the page
    event.preventDefault();

    // Get the inputs from the user
    const mail_recipients = document.querySelector('#compose-recipients').value.toString();
    const mail_subject = document.querySelector('#compose-subject').value.toString();
    const mail_body = document.querySelector('#compose-body').value.toString();

    // Try to send the mail
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: mail_recipients,
        subject: mail_subject,
        body: mail_body,
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result in console
      if (result.error) {
        console.log('Error: ', result.error);
        document.querySelector('#recipient-error').innerHTML = result.error
      }
      else {
        console.log('Result: ', result);
        // Redirects to sent box
        load_mailbox('sent');
      }
    })
    .catch(error => {
      console.log('Error: ', error);
      document.querySelector('#recipient-error').innerHTML = result.error
    });
  }

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch the mailbox
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);

    // Add emails to template
    emails.forEach(element => {
      console.log(element.sender);
      const mail = document.createElement('div');
      mail.innerHTML = `<b> ${element.sender} </b> ${element.subject} - At ${element.timestamp}`;
      document.querySelector('#emails-view').append(mail);
      mail.setAttribute('class', "mail-list-item");
      if (element.read) {
        mail.style.backgroundColor = "lightgray";
      }
    });
  });

}
