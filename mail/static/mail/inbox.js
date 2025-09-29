document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send email event listener
  document.querySelector('#compose-form').addEventListener('submit', send_email);

});

// Pages functions

function compose_email() {

  // Show compose view and hide other views
  // document.querySelector('#emails-view').style.display = 'none';
  // document.querySelector('#compose-view').style.display = 'block';
  show_page('#compose-view');

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function reply_email(mail_id) {

  // Load compose-view
  show_page('#compose-view');

  // Pre-load data
  fetch(`/emails/${mail_id}`)
    .then(response => response.json())
    .then(mail => {
      document.querySelector('#compose-recipients').value = mail.sender;
      document.querySelector('#compose-subject').value = `Re: ${mail.subject}`;
      document.querySelector('#compose-body').value = `\n\n${mail.sender} sent at ${mail.timestamp}:\n${mail.body}`;

      // Set focus on body, and put the cursor on start to begin typing the response
      document.querySelector('#compose-body').focus({ focusVisible: true });
      document.querySelector('#compose-body').setSelectionRange(0, 0);
    });
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
  console.log(`Load mailbox: ${mailbox}`);

  const emails_view = document.querySelector('#emails-view');

  // Show the mailbox name
  emails_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch the mailbox, and reload the cache (so it refresh)
  fetch(`emails/${mailbox}?timestamp=${Date.now()}`, {cache: 'reload'})
    .then(response => response.json())
    .then(emails => {
      // Response log
      console.log(emails);

      // Delete previous loaded e-mails so it only shows lastest
      emails_view.innerHTML = '';

      // Add emails to template
      emails.forEach(element => {

        // Create a div element for each mail
        let mail = document.createElement('div');
        mail.innerHTML = `<b> ${element.sender} </b> ${element.subject} - At ${element.timestamp}`;
        emails_view.append(mail);

        // Styling
        mail.setAttribute('class', "mail-list-item");
        if (element.read) {
          mail.style.backgroundColor = "lightgray";
        }

        // ID
        mail.setAttribute('id', `${element.id}`)

        // Event
        mail.addEventListener('click', function () {
          load_email(element.id);
        });
      });
    });

  // Display page
  show_page('#emails-view');
}

function load_email(mail_id) {

  // Show mail view page
  show_page('#email-view');

  // Fetch the mail by id
  fetch(`/emails/${mail_id}`)
    .then(response => response.json())
    .then(mail => {

      // Fill the HTML table for mail header
      document.querySelector('#mail-sender').innerHTML = `${mail['sender']}`;
      document.querySelector('#mail-recipents').innerHTML = `${mail['recipients']}`
      document.querySelector('#mail-subject').innerHTML = `${mail['subject']}`;
      document.querySelector('#mail-timestamp').innerHTML = `${mail['timestamp']}`;

      // Mail body
      document.querySelector('#mail-body').innerHTML = `${mail['body']}`;

      // Set buttons name attribute
      const archive_button = document.querySelector('#archive-btn');
      const reply_button = document.querySelector('#reply-btn');
      archive_button.setAttribute('name', `${mail_id}`);
      reply_button.setAttribute('name', `${mail_id}`);

      // Archive button
      // -- Set button display
      if (mail.archived == false) {
        archive_button.innerHTML = 'Archive';
      } else {
        archive_button.innerHTML = 'Unarchive';
      }

      // Archive button
      archive_button.addEventListener('click', function () {
        archive_email(archive_button.getAttribute('name'), mail.archived);
      }, {once : true});

      // Reply button
      reply_button.addEventListener('click', function () {
        reply_email(reply_button.getAttribute('name'));
      }, {once : true});

      // PUT mail on read
      fetch(`/emails/${mail_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
    });
}

function archive_email(mail_id, is_archived) {

  // Archive or unarchive
  fetch(`/emails/${mail_id}?timestamp=${Date.now()}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !is_archived
    })
  })
  .then(response => {
    if(response.status === 204){
      load_mailbox('inbox');
    }
  });

}

// Utilitary functions
function show_page(page) {

  // Hide Pages
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show selected page
  document.querySelector(page).style.display = 'block';
}