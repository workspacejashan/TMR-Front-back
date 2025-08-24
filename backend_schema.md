### **Backend Requirement Prompt for "ThatsMyRecruiter" using Supabase**

**Project Goal:**
Build a complete backend for a React application called "ThatsMyRecruiter" using Supabase. The application is a platform connecting job candidates and recruiters. Candidates build and manage their professional profiles, and recruiters can search for and connect with candidates.

The backend must support user authentication (for both candidates and recruiters), data storage for profiles and documents, a real-time messaging system, and a candidate search functionality.

---

### **Part 1: Supabase Project Setup**

1.  **Create Project:** Go to the Supabase dashboard and create a new project named "ThatsMyRecruiter".
2.  **Database Password:** Securely save the database password generated during project creation.
3.  **API Keys:** Navigate to `Project Settings > API`. Find and copy the **Project URL** and the `anon` **public** API key.
4.  **Frontend Environment:** These keys will be used in the React frontend as environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

### **Part 2: Database Schema & Storage**

Create the following tables and configure Supabase Storage.

**1. Storage Buckets:**
Create two public storage buckets:
*   `profile-photos`: For user profile pictures.
*   `documents`: For candidate-uploaded files like resumes and certifications.

**2. Tables:**

**`user_profiles`**
This table will store public profile data for all users, linked one-to-one with the `auth.users` table.

| Column                | Type                      | Constraints                               | Notes                                                              |
| --------------------- | ------------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `id`                  | `uuid`                    | Primary Key, References `auth.users.id`   | The user's unique ID from Supabase Auth.                           |
| `email`               | `text`                    |                                           | User's email, synced from `auth.users`.                            |
| `user_type`           | `text`                    | Not Null, `CHECK (user_type IN ('CANDIDATE', 'RECRUITER'))` | 'CANDIDATE' or 'RECRUITER'.                                        |
| `name`                | `text`                    |                                           | Full name of the user.                                             |
| `title`               | `text`                    |                                           | Professional title (e.g., "Senior Registered Nurse").              |
| `profile_photo_url`   | `text`                    |                                           | URL to the image in the `profile-photos` storage bucket.           |
| `roles`               | `text[]`                  |                                           | **Candidate only.** Preferred job roles.                           |
| `shift`               | `text`                    |                                           | **Candidate only.** Preferred work shift.                          |
| `location`            | `text`                    |                                           | **Candidate only.** Preferred location.                            |
| `pay_expectations`    | `text`                    |                                           | **Candidate only.** Salary or hourly rate expectations.            |
| `contact_methods`     | `text[]`                  |                                           | **Candidate only.** e.g., `{'call', 'text'}`.                       |
| `time_zone`           | `text`                    |                                           | **Candidate only.** User's timezone.                               |
| `working_hours`       | `text`                    |                                           | **Candidate only.** General working hours.                         |
| `call_available_hours`| `text`                    |                                           | **Candidate only.** Best times for calls.                          |
| `updated_at`          | `timestamp with time zone`| `default now()`                           | Automatically updates on changes.                                  |

**`skills`**
Stores individual skills for candidates.

| Column     | Type      | Constraints                          | Notes                                    |
| ---------- | --------- | ------------------------------------ | ---------------------------------------- |
| `id`       | `bigint`  | Primary Key, Generated always as identity | Unique ID for the skill entry.           |
| `user_id`  | `uuid`    | Not Null, References `user_profiles.id` | Links the skill to a candidate.          |
| `name`     | `text`    | Not Null                             | Name of the skill (e.g., "IV Insertion"). |
| `level`    | `smallint`| Not Null, `CHECK (level BETWEEN 1 AND 4)` | Proficiency level from 1 to 4.           |

**`documents`**
Stores metadata for files uploaded by candidates.

| Column         | Type      | Constraints                          | Notes                                                   |
| -------------- | --------- | ------------------------------------ | ------------------------------------------------------- |
| `id`           | `uuid`    | Primary Key, `default uuid_generate_v4()` | Unique ID for the document.                             |
| `user_id`      | `uuid`    | Not Null, References `user_profiles.id` | Links the document to a candidate.                      |
| `file_path`    | `text`    | Not Null                             | Path to the file in the `documents` storage bucket.     |
| `name`         | `text`    | Not Null                             | The original name of the file.                          |
| `size`         | `bigint`  | Not Null                             | File size in bytes.                                     |
| `type`         | `text`    | Not Null                             | File extension or MIME type.                            |
| `visibility`   | `text`    | Not Null, `default 'gated'`, `CHECK (visibility IN ('public', 'gated', 'private'))` | Access control for the document.                        |
| `created_at`   | `timestamp with time zone`| `default now()`       | Timestamp of upload.                                    |

**`conversations`**
Represents a chat thread between a recruiter and a candidate.

| Column     | Type      | Constraints                               | Notes                                                       |
| ---------- | --------- | ----------------------------------------- | ----------------------------------------------------------- |
| `id`       | `uuid`    | Primary Key, `default uuid_generate_v4()` | Unique ID for the conversation.                             |
| `status`   | `text`    | Not Null, `CHECK (status IN ('pending', 'accepted', 'denied'))` | Tracks the state of the connection request.                 |
| `created_at` | `timestamp with time zone`| `default now()`        |                                                             |

**`conversation_participants`**
A join table linking users to conversations.

| Column           | Type   | Constraints                          | Notes                               |
| ---------------- | ------ | ------------------------------------ | ----------------------------------- |
| `id`             | `bigint`| Primary Key, Generated always as identity |                                     |
| `conversation_id`| `uuid` | Not Null, References `conversations.id` | Links to the conversation.          |
| `user_id`        | `uuid` | Not Null, References `user_profiles.id` | Links to the participant (user).    |

**`messages`**
Stores each individual message within a conversation.

| Column           | Type      | Constraints                          | Notes                                    |
| ---------------- | --------- | ------------------------------------ | ---------------------------------------- |
| `id`             | `bigint`  | Primary Key, Generated always as identity | Unique ID for the message.               |
| `conversation_id`| `uuid`    | Not Null, References `conversations.id` | Links the message to a conversation.     |
| `sender_id`      | `uuid`    | Not Null, References `user_profiles.id` | The user who sent the message.           |
| `text`           | `text`    | Not Null, `CHECK (text <> '')`        | The content of the message.              |
| `created_at`     | `timestamp with time zone`| `default now()`       |                                          |

---

### **Part 3: Authentication & User Setup**

**1. Auth Providers:**
In the Supabase dashboard under `Authentication > Providers`, enable **Email** and **Google**.

**2. New User Trigger:**
Create a PostgreSQL function and trigger to automatically insert a new row into `public.user_profiles` whenever a new user signs up via `auth.users`.

```sql
-- Function to create a new profile for a new user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, user_type)
  values (new.id, new.email, new.raw_user_meta_data ->> 'user_type');
  return new;
end;
$$;

-- Trigger to call the function after a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**3. Frontend Auth Logic:**
The frontend `AuthModal` should call Supabase auth functions. The `user_type` selected during signup must be passed as `metadata`.

*   **Sign Up:**
    ```javascript
    const { data, error } = await supabase.auth.signUp({
      email: 'user@example.com',
      password: 'example-password',
      options: {
        data: {
          user_type: 'CANDIDATE' // or 'RECRUITER'
        }
      }
    });
    ```
*   **Log In:**
    ```javascript
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'example-password',
    });
    ```
*   **Sign In with Google:**
    ```javascript
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    ```
*   **Data Flow:** User submits login/signup -> Supabase Auth returns a session -> Store session using `supabase-js`'s default (localStorage) -> Use the session to make authenticated requests.

---

### **Part 4: APIs / Queries (using `supabase-js` client)**

Organize all Supabase client logic in a single file, e.g., `/services/supabaseClient.js`.

**Required Functions (with example implementations):**

*   **Fetch Current User's Profile:**
    ```javascript
    async function getUserProfile(userId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*') // Select all profile fields
        .eq('id', userId)
        .single();
      return { data, error };
    }
    ```
*   **Update User Profile (Candidate):**
    ```javascript
    async function updateUserProfile(userId, profileData) {
      // profileData = { name, title, roles, shift, etc. }
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId);
    }
    ```
*   **Manage Skills (CRUD):**
    ```javascript
    // Fetch
    async function getSkills(userId) { /* ... select from 'skills' where user_id = userId ... */ }
    // Add
    async function addSkills(userId, skills) { /* ... insert into 'skills' ... */ }
    // Remove (clear and re-insert is easiest)
    async function removeAllSkills(userId) { /* ... delete from 'skills' where user_id = userId ... */ }
    ```
*   **Manage Documents (Upload/Delete):**
    ```javascript
    // Upload
    async function uploadDocument(userId, file) {
      const filePath = `${userId}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('documents').insert({
        user_id: userId,
        file_path: filePath,
        name: file.name,
        // ...other metadata
      });
    }

    // Delete
    async function deleteDocument(doc) {
      const { error: storageError } = await supabase.storage.from('documents').remove([doc.file_path]);
      const { error: dbError } = await supabase.from('documents').delete().eq('id', doc.id);
    }
    ```
*   **Find Candidates (RPC Function):**
    Simple filtering on the frontend is inefficient. Create a PostgreSQL function that recruiters can call.
    ```sql
    create function search_candidates(p_skills text[], p_location text)
    returns setof user_profiles
    language sql
    as $$
      select p.* from user_profiles p
      where p.user_type = 'CANDIDATE'
      and (p_location is null or p.location ilike '%' || p_location || '%')
      and (p_skills is null or exists (
        select 1 from skills s
        where s.user_id = p.id and s.name = any(p_skills)
      ));
    $$;
    ```
    Call it from the frontend:
    ```javascript
    const { data, error } = await supabase.rpc('search_candidates', {
      p_skills: ['IV Insertion', 'Triage'],
      p_location: 'New York'
    });
    ```
*   **Messaging (Real-time):**
    -   **Fetch conversations:** Query `conversations` where the user is a participant.
    -   **Fetch messages:** Query `messages` for a given `conversation_id`.
    -   **Send message:** Insert into the `messages` table.
    -   **Real-time Subscription:** Use Supabase Realtime to listen for new messages.
        ```javascript
        const messageListener = supabase.channel('public:messages')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convoId}` }, payload => {
            // Add new message to the UI
          })
          .subscribe();
        ```

---

### **Part 5: Security with Row Level Security (RLS)**

Enable RLS on all tables and create policies to ensure users can only access their own data.

*   **`user_profiles` Table:**
    ```sql
    -- Users can view their own profile.
    create policy "Allow individual read access" on user_profiles for select using (auth.uid() = id);
    -- Users can update their own profile.
    create policy "Allow individual update access" on user_profiles for update using (auth.uid() = id);
    -- Recruiters can view all candidate profiles.
    create policy "Allow recruiters to read candidate profiles" on user_profiles for select to authenticated
    using (
      (select user_type from user_profiles where id = auth.uid()) = 'RECRUITER'
      AND user_type = 'CANDIDATE'
    );
    ```
*   **`skills` and `documents` Tables:**
    ```sql
    -- Users can manage their own skills/documents.
    create policy "Allow full access to own skills" on skills for all using (auth.uid() = user_id);
    create policy "Allow full access to own documents" on documents for all using (auth.uid() = user_id);
    -- Recruiters can view public/gated documents of candidates they can see.
    create policy "Allow recruiters to read public/gated documents" on documents for select to authenticated
    using (
      (select user_type from user_profiles where id = auth.uid()) = 'RECRUITER'
      AND visibility IN ('public', 'gated')
    );
    ```
*   **`conversations`, `conversation_participants`, `messages`:**
    ```sql
    -- Users can only access conversations they are part of.
    create policy "Allow access to own conversations" on conversations for all
    using (id in (select conversation_id from conversation_participants where user_id = auth.uid()));
    -- Similar policies for the other two tables, ensuring auth.uid() is in the participant list for the relevant conversation.
    ```

---

### **Part 6: Deployment**

1.  **Frontend Host:** The app can be deployed to Netlify, Vercel, or a similar service.
2.  **Environment Variables:** In the Netlify project settings, add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
3.  **Security:** The `anon` key is safe to expose in the browser client because Row Level Security policies will protect the data on the backend. All sensitive operations are blocked by RLS rules unless the user is properly authenticated.
