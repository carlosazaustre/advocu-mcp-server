## POST /activity-drafts/content-creation

Creates a published content draft.

| Name            | Type    | Description                                | Restrictions                                                 |
| --------------- | ------- | ------------------------------------------ | ------------------------------------------------------------ |
| contentType     | string  | Content type                               | enum (8 values)                                              |
| title           | string  | What was the title?                        | min length 3, max length 200                                 |
| description     | string  | What was it about?                         | max length 2000                                              |
| tags            | array   | Tags                                       | enum (108 values), min items 0                               |
| metrics.readers | integer | How many people read your content?         | minimum 1                                                    |
| activityDate    | string  | Date published                             | pattern YYYY-MM-DD                                           |
| activityUrl     | string  | Link to Content                            | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo  | string  | Additional information                     | max length 2000                                              |
| private         | boolean | Do you want to make this activity private? | -                                                            |

------

## POST /activity-drafts/public-speaking

Records a talk, conference, or public presentation.

| Name              | Type    | Description                                     | Restrictions                                                 |
| ----------------- | ------- | ----------------------------------------------- | ------------------------------------------------------------ |
| title             | string  | What was the title of your talk?                | min length 3, max length 200                                 |
| description       | string  | What was it about?                              | max length 2000                                              |
| tags              | array   | Tags                                            | enum (108 values), min items 0                               |
| metrics.attendees | integer | How many people attended your session in total? | minimum 1                                                    |
| eventFormat       | string  | Select event format                             | enum (3 values)                                              |
| country           | string  | Country                                         | enum (251 values), if eventFormat is In-Person or Hybrid     |
| inPersonAttendees | integer | In-person attendees (if applicable)             | minimum 0, if eventFormat is Hybrid or In-Person             |
| activityDate      | string  | Date of your talk                               | pattern YYYY-MM-DD                                           |
| activityUrl       | string  | Event link or relevant URL                      | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo    | string  | Additional information                          | max length 2000                                              |
| private           | boolean | Do you want to make this activity private?      | -                                                            |

------

## POST /activity-drafts/workshop

Records a training workshop.

| Name              | Type    | Description                                 | Restrictions                                                 |
| ----------------- | ------- | ------------------------------------------- | ------------------------------------------------------------ |
| title             | string  | What was the name of your workshop session? | min length 3, max length 200                                 |
| description       | string  | What was it about?                          | max length 2000                                              |
| tags              | array   | Tags                                        | enum (108 values), min items 0                               |
| metrics.attendees | integer | How many people have been trained?          | minimum 1                                                    |
| eventFormat       | string  | Select event format                         | enum (3 values)                                              |
| country           | string  | Country                                     | enum (251 values), if eventFormat is In-Person or Hybrid     |
| inPersonAttendees | integer | In-person attendees (if applicable)         | minimum 0, if eventFormat is Hybrid or In-Person             |
| activityDate      | string  | Date of your workshop                       | pattern YYYY-MM-DD                                           |
| activityUrl       | string  | Workshop/event link                         | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo    | string  | Additional information                      | max length 2000                                              |
| private           | boolean | Do you want to make this activity private?  | -                                                            |

------

## POST /activity-drafts/mentoring

Records a mentoring session.

| Name              | Type    | Description                                  | Restrictions                                                 |
| ----------------- | ------- | -------------------------------------------- | ------------------------------------------------------------ |
| title             | string  | What was the name of your mentoring session? | min length 3, max length 200                                 |
| description       | string  | What was it about?                           | max length 2000                                              |
| tags              | array   | Tags                                         | enum (108 values), min items 0                               |
| metrics.attendees | integer | How many people have been mentored in total? | minimum 1                                                    |
| eventFormat       | string  | Select event format                          | enum (3 values)                                              |
| country           | string  | Country                                      | enum (251 values), if eventFormat is In-Person or Hybrid     |
| inPersonAttendees | integer | In-person attendees (if applicable)          | minimum 0, if eventFormat is Hybrid or In-Person             |
| activityDate      | string  | Date of your mentoring session               | pattern YYYY-MM-DD                                           |
| activityUrl       | string  | Event or relevant link                       | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo    | string  | Additional information                       | max length 2000                                              |
| private           | boolean | Do you want to make this activity private?   | -                                                            |

------

## POST /activity-drafts/product-feedback-given

Records product feedback.

| Name               | Type    | Description                                | Restrictions                   |
| ------------------ | ------- | ------------------------------------------ | ------------------------------ |
| title              | string  | Title                                      | min length 3, max length 200   |
| description        | string  | Description                                | max length 2000                |
| contentType        | string  | Content type                               | enum (2 values)                |
| productDescription | string  | What product was it about?                 | max length 500                 |
| tags               | array   | Tags                                       | enum (108 values), min items 0 |
| metrics.timeSpent  | integer | Time spent (in minutes)                    | minimum 1                      |
| activityDate       | string  | Participation Date                         | pattern YYYY-MM-DD             |
| additionalInfo     | string  | Additional information                     | max length 2000                |
| private            | boolean | Do you want to make this activity private? | -                              |

------

## POST /activity-drafts/interaction-with-googlers

Records a direct interaction with Google personnel.

| Name              | Type    | Description                                | Restrictions                   |
| ----------------- | ------- | ------------------------------------------ | ------------------------------ |
| title             | string  | Title                                      | min length 3, max length 200   |
| description       | string  | Description                                | max length 2000                |
| format            | string  | Format                                     | enum (8 values)                |
| interactionType   | string  | Interaction Type                           | enum (6 values)                |
| tags              | array   | Tags                                       | enum (108 values), min items 0 |
| metrics.timeSpent | integer | Time spent (in minutes)                    | minimum 1                      |
| activityDate      | string  | Interaction Date                           | pattern YYYY-MM-DD             |
| additionalInfo    | string  | Additional information                     | max length 2000                |
| additionalLinks   | string  | Additional links                           | max length 2000                |
| private           | boolean | Do you want to make this activity private? | -                              |

------

## POST /activity-drafts/storiesName

Records a story or significant experience.

| Name             | Type    | Description                                | Restrictions                                                 |
| ---------------- | ------- | ------------------------------------------ | ------------------------------------------------------------ |
| title            | string  | Title of the story                         | min length 3, max length 200                                 |
| description      | string  | Description                                | max length 2000                                              |
| whyIsSignificant | string  | Why is it significant                      | max length 2000                                              |
| significanceType | string  | Significance type                          | enum (6 values)                                              |
| activityUrl      | string  | Link                                       | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| tags             | array   | Tags                                       | enum (108 values), min items 0                               |
| metrics.impact   | integer | Impact (views, reads, attendees, etc.)     | minimum 1                                                    |
| additionalInfo   | string  | Additional information                     | max length 2000                                              |
| private          | boolean | Do you want to make this activity private? | -                                                            |