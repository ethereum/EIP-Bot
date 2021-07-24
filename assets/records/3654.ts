import { MockRecord } from "src/utils";

export default [
  {
    req: {
      method: "GET",
      url: "https://api.github.com/repos/ethereum/EIPs/pulls/3654"
    },
    res: {
      status: 200,
      data: {
        url: "https://api.github.com/repos/ethereum/EIPs/pulls/3654",
        id: 690093148,
        node_id: "MDExOlB1bGxSZXF1ZXN0NjkwMDkzMTQ4",
        html_url: "https://github.com/ethereum/EIPs/pull/3654",
        diff_url: "https://github.com/ethereum/EIPs/pull/3654.diff",
        patch_url: "https://github.com/ethereum/EIPs/pull/3654.patch",
        issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
        number: 3654,
        state: "closed",
        locked: false,
        title: "Promote EIP to final",
        user: {
          login: "fulldecent",
          id: 382183,
          node_id: "MDQ6VXNlcjM4MjE4Mw==",
          avatar_url: "https://avatars.githubusercontent.com/u/382183?v=4",
          gravatar_id: "",
          url: "https://api.github.com/users/fulldecent",
          html_url: "https://github.com/fulldecent",
          followers_url: "https://api.github.com/users/fulldecent/followers",
          following_url:
            "https://api.github.com/users/fulldecent/following{/other_user}",
          gists_url: "https://api.github.com/users/fulldecent/gists{/gist_id}",
          starred_url:
            "https://api.github.com/users/fulldecent/starred{/owner}{/repo}",
          subscriptions_url:
            "https://api.github.com/users/fulldecent/subscriptions",
          organizations_url: "https://api.github.com/users/fulldecent/orgs",
          repos_url: "https://api.github.com/users/fulldecent/repos",
          events_url:
            "https://api.github.com/users/fulldecent/events{/privacy}",
          received_events_url:
            "https://api.github.com/users/fulldecent/received_events",
          type: "User",
          site_admin: false
        },
        body: "Passed Last Call period without any changes",
        created_at: "2021-07-14T17:24:28Z",
        updated_at: "2021-07-22T08:41:03Z",
        closed_at: "2021-07-22T08:41:03Z",
        merged_at: "2021-07-22T08:41:03Z",
        merge_commit_sha: "d7239c2785e8059913c1c36bcb0a77a924ba1278",
        assignee: null,
        assignees: [],
        requested_reviewers: [],
        requested_teams: [],
        labels: [],
        milestone: null,
        draft: false,
        commits_url:
          "https://api.github.com/repos/ethereum/EIPs/pulls/3654/commits",
        review_comments_url:
          "https://api.github.com/repos/ethereum/EIPs/pulls/3654/comments",
        review_comment_url:
          "https://api.github.com/repos/ethereum/EIPs/pulls/comments{/number}",
        comments_url:
          "https://api.github.com/repos/ethereum/EIPs/issues/3654/comments",
        statuses_url:
          "https://api.github.com/repos/ethereum/EIPs/statuses/8aca1212d7e716c9c47f8b39efec86795961d4cb",
        head: {
          label: "fulldecent:patch-78",
          ref: "patch-78",
          sha: "8aca1212d7e716c9c47f8b39efec86795961d4cb",
          user: {
            login: "fulldecent",
            id: 382183,
            node_id: "MDQ6VXNlcjM4MjE4Mw==",
            avatar_url: "https://avatars.githubusercontent.com/u/382183?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/fulldecent",
            html_url: "https://github.com/fulldecent",
            followers_url: "https://api.github.com/users/fulldecent/followers",
            following_url:
              "https://api.github.com/users/fulldecent/following{/other_user}",
            gists_url:
              "https://api.github.com/users/fulldecent/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/fulldecent/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/fulldecent/subscriptions",
            organizations_url: "https://api.github.com/users/fulldecent/orgs",
            repos_url: "https://api.github.com/users/fulldecent/repos",
            events_url:
              "https://api.github.com/users/fulldecent/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/fulldecent/received_events",
            type: "User",
            site_admin: false
          },
          repo: {
            id: 117486770,
            node_id: "MDEwOlJlcG9zaXRvcnkxMTc0ODY3NzA=",
            name: "EIPs",
            full_name: "fulldecent/EIPs",
            private: false,
            owner: {
              login: "fulldecent",
              id: 382183,
              node_id: "MDQ6VXNlcjM4MjE4Mw==",
              avatar_url: "https://avatars.githubusercontent.com/u/382183?v=4",
              gravatar_id: "",
              url: "https://api.github.com/users/fulldecent",
              html_url: "https://github.com/fulldecent",
              followers_url:
                "https://api.github.com/users/fulldecent/followers",
              following_url:
                "https://api.github.com/users/fulldecent/following{/other_user}",
              gists_url:
                "https://api.github.com/users/fulldecent/gists{/gist_id}",
              starred_url:
                "https://api.github.com/users/fulldecent/starred{/owner}{/repo}",
              subscriptions_url:
                "https://api.github.com/users/fulldecent/subscriptions",
              organizations_url: "https://api.github.com/users/fulldecent/orgs",
              repos_url: "https://api.github.com/users/fulldecent/repos",
              events_url:
                "https://api.github.com/users/fulldecent/events{/privacy}",
              received_events_url:
                "https://api.github.com/users/fulldecent/received_events",
              type: "User",
              site_admin: false
            },
            html_url: "https://github.com/fulldecent/EIPs",
            description: "The Ethereum Improvement Proposal",
            fork: true,
            url: "https://api.github.com/repos/fulldecent/EIPs",
            forks_url: "https://api.github.com/repos/fulldecent/EIPs/forks",
            keys_url:
              "https://api.github.com/repos/fulldecent/EIPs/keys{/key_id}",
            collaborators_url:
              "https://api.github.com/repos/fulldecent/EIPs/collaborators{/collaborator}",
            teams_url: "https://api.github.com/repos/fulldecent/EIPs/teams",
            hooks_url: "https://api.github.com/repos/fulldecent/EIPs/hooks",
            issue_events_url:
              "https://api.github.com/repos/fulldecent/EIPs/issues/events{/number}",
            events_url: "https://api.github.com/repos/fulldecent/EIPs/events",
            assignees_url:
              "https://api.github.com/repos/fulldecent/EIPs/assignees{/user}",
            branches_url:
              "https://api.github.com/repos/fulldecent/EIPs/branches{/branch}",
            tags_url: "https://api.github.com/repos/fulldecent/EIPs/tags",
            blobs_url:
              "https://api.github.com/repos/fulldecent/EIPs/git/blobs{/sha}",
            git_tags_url:
              "https://api.github.com/repos/fulldecent/EIPs/git/tags{/sha}",
            git_refs_url:
              "https://api.github.com/repos/fulldecent/EIPs/git/refs{/sha}",
            trees_url:
              "https://api.github.com/repos/fulldecent/EIPs/git/trees{/sha}",
            statuses_url:
              "https://api.github.com/repos/fulldecent/EIPs/statuses/{sha}",
            languages_url:
              "https://api.github.com/repos/fulldecent/EIPs/languages",
            stargazers_url:
              "https://api.github.com/repos/fulldecent/EIPs/stargazers",
            contributors_url:
              "https://api.github.com/repos/fulldecent/EIPs/contributors",
            subscribers_url:
              "https://api.github.com/repos/fulldecent/EIPs/subscribers",
            subscription_url:
              "https://api.github.com/repos/fulldecent/EIPs/subscription",
            commits_url:
              "https://api.github.com/repos/fulldecent/EIPs/commits{/sha}",
            git_commits_url:
              "https://api.github.com/repos/fulldecent/EIPs/git/commits{/sha}",
            comments_url:
              "https://api.github.com/repos/fulldecent/EIPs/comments{/number}",
            issue_comment_url:
              "https://api.github.com/repos/fulldecent/EIPs/issues/comments{/number}",
            contents_url:
              "https://api.github.com/repos/fulldecent/EIPs/contents/{+path}",
            compare_url:
              "https://api.github.com/repos/fulldecent/EIPs/compare/{base}...{head}",
            merges_url: "https://api.github.com/repos/fulldecent/EIPs/merges",
            archive_url:
              "https://api.github.com/repos/fulldecent/EIPs/{archive_format}{/ref}",
            downloads_url:
              "https://api.github.com/repos/fulldecent/EIPs/downloads",
            issues_url:
              "https://api.github.com/repos/fulldecent/EIPs/issues{/number}",
            pulls_url:
              "https://api.github.com/repos/fulldecent/EIPs/pulls{/number}",
            milestones_url:
              "https://api.github.com/repos/fulldecent/EIPs/milestones{/number}",
            notifications_url:
              "https://api.github.com/repos/fulldecent/EIPs/notifications{?since,all,participating}",
            labels_url:
              "https://api.github.com/repos/fulldecent/EIPs/labels{/name}",
            releases_url:
              "https://api.github.com/repos/fulldecent/EIPs/releases{/id}",
            deployments_url:
              "https://api.github.com/repos/fulldecent/EIPs/deployments",
            created_at: "2018-01-15T02:21:45Z",
            updated_at: "2019-11-12T16:00:58Z",
            pushed_at: "2021-07-15T17:24:17Z",
            git_url: "git://github.com/fulldecent/EIPs.git",
            ssh_url: "git@github.com:fulldecent/EIPs.git",
            clone_url: "https://github.com/fulldecent/EIPs.git",
            svn_url: "https://github.com/fulldecent/EIPs",
            homepage: "",
            size: 20023,
            stargazers_count: 0,
            watchers_count: 0,
            language: "HTML",
            has_issues: false,
            has_projects: true,
            has_downloads: true,
            has_wiki: false,
            has_pages: false,
            forks_count: 3,
            mirror_url: null,
            archived: false,
            disabled: false,
            open_issues_count: 0,
            license: null,
            forks: 3,
            open_issues: 0,
            watchers: 0,
            default_branch: "master"
          }
        },
        base: {
          label: "ethereum:master",
          ref: "master",
          sha: "0caa338fe88fb931a02556c9cb5758e044b6c91d",
          user: {
            login: "ethereum",
            id: 6250754,
            node_id: "MDEyOk9yZ2FuaXphdGlvbjYyNTA3NTQ=",
            avatar_url: "https://avatars.githubusercontent.com/u/6250754?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/ethereum",
            html_url: "https://github.com/ethereum",
            followers_url: "https://api.github.com/users/ethereum/followers",
            following_url:
              "https://api.github.com/users/ethereum/following{/other_user}",
            gists_url: "https://api.github.com/users/ethereum/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/ethereum/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/ethereum/subscriptions",
            organizations_url: "https://api.github.com/users/ethereum/orgs",
            repos_url: "https://api.github.com/users/ethereum/repos",
            events_url:
              "https://api.github.com/users/ethereum/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/ethereum/received_events",
            type: "Organization",
            site_admin: false
          },
          repo: {
            id: 44971752,
            node_id: "MDEwOlJlcG9zaXRvcnk0NDk3MTc1Mg==",
            name: "EIPs",
            full_name: "ethereum/EIPs",
            private: false,
            owner: {
              login: "ethereum",
              id: 6250754,
              node_id: "MDEyOk9yZ2FuaXphdGlvbjYyNTA3NTQ=",
              avatar_url: "https://avatars.githubusercontent.com/u/6250754?v=4",
              gravatar_id: "",
              url: "https://api.github.com/users/ethereum",
              html_url: "https://github.com/ethereum",
              followers_url: "https://api.github.com/users/ethereum/followers",
              following_url:
                "https://api.github.com/users/ethereum/following{/other_user}",
              gists_url:
                "https://api.github.com/users/ethereum/gists{/gist_id}",
              starred_url:
                "https://api.github.com/users/ethereum/starred{/owner}{/repo}",
              subscriptions_url:
                "https://api.github.com/users/ethereum/subscriptions",
              organizations_url: "https://api.github.com/users/ethereum/orgs",
              repos_url: "https://api.github.com/users/ethereum/repos",
              events_url:
                "https://api.github.com/users/ethereum/events{/privacy}",
              received_events_url:
                "https://api.github.com/users/ethereum/received_events",
              type: "Organization",
              site_admin: false
            },
            html_url: "https://github.com/ethereum/EIPs",
            description: "The Ethereum Improvement Proposal repository",
            fork: false,
            url: "https://api.github.com/repos/ethereum/EIPs",
            forks_url: "https://api.github.com/repos/ethereum/EIPs/forks",
            keys_url:
              "https://api.github.com/repos/ethereum/EIPs/keys{/key_id}",
            collaborators_url:
              "https://api.github.com/repos/ethereum/EIPs/collaborators{/collaborator}",
            teams_url: "https://api.github.com/repos/ethereum/EIPs/teams",
            hooks_url: "https://api.github.com/repos/ethereum/EIPs/hooks",
            issue_events_url:
              "https://api.github.com/repos/ethereum/EIPs/issues/events{/number}",
            events_url: "https://api.github.com/repos/ethereum/EIPs/events",
            assignees_url:
              "https://api.github.com/repos/ethereum/EIPs/assignees{/user}",
            branches_url:
              "https://api.github.com/repos/ethereum/EIPs/branches{/branch}",
            tags_url: "https://api.github.com/repos/ethereum/EIPs/tags",
            blobs_url:
              "https://api.github.com/repos/ethereum/EIPs/git/blobs{/sha}",
            git_tags_url:
              "https://api.github.com/repos/ethereum/EIPs/git/tags{/sha}",
            git_refs_url:
              "https://api.github.com/repos/ethereum/EIPs/git/refs{/sha}",
            trees_url:
              "https://api.github.com/repos/ethereum/EIPs/git/trees{/sha}",
            statuses_url:
              "https://api.github.com/repos/ethereum/EIPs/statuses/{sha}",
            languages_url:
              "https://api.github.com/repos/ethereum/EIPs/languages",
            stargazers_url:
              "https://api.github.com/repos/ethereum/EIPs/stargazers",
            contributors_url:
              "https://api.github.com/repos/ethereum/EIPs/contributors",
            subscribers_url:
              "https://api.github.com/repos/ethereum/EIPs/subscribers",
            subscription_url:
              "https://api.github.com/repos/ethereum/EIPs/subscription",
            commits_url:
              "https://api.github.com/repos/ethereum/EIPs/commits{/sha}",
            git_commits_url:
              "https://api.github.com/repos/ethereum/EIPs/git/commits{/sha}",
            comments_url:
              "https://api.github.com/repos/ethereum/EIPs/comments{/number}",
            issue_comment_url:
              "https://api.github.com/repos/ethereum/EIPs/issues/comments{/number}",
            contents_url:
              "https://api.github.com/repos/ethereum/EIPs/contents/{+path}",
            compare_url:
              "https://api.github.com/repos/ethereum/EIPs/compare/{base}...{head}",
            merges_url: "https://api.github.com/repos/ethereum/EIPs/merges",
            archive_url:
              "https://api.github.com/repos/ethereum/EIPs/{archive_format}{/ref}",
            downloads_url:
              "https://api.github.com/repos/ethereum/EIPs/downloads",
            issues_url:
              "https://api.github.com/repos/ethereum/EIPs/issues{/number}",
            pulls_url:
              "https://api.github.com/repos/ethereum/EIPs/pulls{/number}",
            milestones_url:
              "https://api.github.com/repos/ethereum/EIPs/milestones{/number}",
            notifications_url:
              "https://api.github.com/repos/ethereum/EIPs/notifications{?since,all,participating}",
            labels_url:
              "https://api.github.com/repos/ethereum/EIPs/labels{/name}",
            releases_url:
              "https://api.github.com/repos/ethereum/EIPs/releases{/id}",
            deployments_url:
              "https://api.github.com/repos/ethereum/EIPs/deployments",
            created_at: "2015-10-26T13:57:23Z",
            updated_at: "2021-07-24T06:31:46Z",
            pushed_at: "2021-07-24T06:31:39Z",
            git_url: "git://github.com/ethereum/EIPs.git",
            ssh_url: "git@github.com:ethereum/EIPs.git",
            clone_url: "https://github.com/ethereum/EIPs.git",
            svn_url: "https://github.com/ethereum/EIPs",
            homepage: "https://eips.ethereum.org/",
            size: 19837,
            stargazers_count: 6881,
            watchers_count: 6881,
            language: "Solidity",
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: false,
            has_pages: true,
            forks_count: 2667,
            mirror_url: null,
            archived: false,
            disabled: false,
            open_issues_count: 519,
            license: null,
            forks: 2667,
            open_issues: 519,
            watchers: 6881,
            default_branch: "master"
          }
        },
        _links: {
          self: {
            href: "https://api.github.com/repos/ethereum/EIPs/pulls/3654"
          },
          html: {
            href: "https://github.com/ethereum/EIPs/pull/3654"
          },
          issue: {
            href: "https://api.github.com/repos/ethereum/EIPs/issues/3654"
          },
          comments: {
            href:
              "https://api.github.com/repos/ethereum/EIPs/issues/3654/comments"
          },
          review_comments: {
            href:
              "https://api.github.com/repos/ethereum/EIPs/pulls/3654/comments"
          },
          review_comment: {
            href:
              "https://api.github.com/repos/ethereum/EIPs/pulls/comments{/number}"
          },
          commits: {
            href:
              "https://api.github.com/repos/ethereum/EIPs/pulls/3654/commits"
          },
          statuses: {
            href:
              "https://api.github.com/repos/ethereum/EIPs/statuses/8aca1212d7e716c9c47f8b39efec86795961d4cb"
          }
        },
        author_association: "CONTRIBUTOR",
        auto_merge: null,
        active_lock_reason: null,
        mergeable: true,
        rebaseable: true,
        mergeable_state: "unstable",
        merged_by: null,
        comments: 6,
        review_comments: 0,
        maintainer_can_modify: false,
        commits: 1,
        additions: 1,
        deletions: 2,
        changed_files: 1
      }
    }
  },
  {
    req: {
      method: "GET",
      url: "https://api.github.com/repos/ethereum/EIPs/pulls/3654/files"
    },
    res: {
      status: 200,
      data: [
        {
          sha: "f73ff06338a8a3aa315e7da600d84ea45e3609c9",
          filename: "EIPS/eip-2228.md",
          status: "modified",
          additions: 1,
          deletions: 2,
          changes: 3,
          blob_url:
            "https://github.com/ethereum/EIPs/blob/8aca1212d7e716c9c47f8b39efec86795961d4cb/EIPS/eip-2228.md",
          raw_url:
            "https://github.com/ethereum/EIPs/raw/8aca1212d7e716c9c47f8b39efec86795961d4cb/EIPS/eip-2228.md",
          contents_url:
            "https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-2228.md?ref=8aca1212d7e716c9c47f8b39efec86795961d4cb",
          patch:
            "@@ -3,8 +3,7 @@ eip: 2228\n title: Canonicalize the name of network ID 1 and chain ID 1\n author: William Entriken (@fulldecent)\n discussions-to: https://github.com/ethereum/EIPs/issues/2228\n-status: Last Call\n-review-period-end: 2021-07-14\n+status: Final\n type: Informational\n created: 2019-08-04\n ---"
        }
      ]
    }
  },
  {
    req: {
      method: "GET",
      url:
        "https://api.github.com/repos/ethereum/EIPs/contents/EIPS%2Feip-2228.md?ref=8aca1212d7e716c9c47f8b39efec86795961d4cb"
    },
    res: {
      status: 200,
      data: {
        name: "eip-2228.md",
        path: "EIPS/eip-2228.md",
        sha: "f73ff06338a8a3aa315e7da600d84ea45e3609c9",
        size: 5059,
        url:
          "https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-2228.md?ref=8aca1212d7e716c9c47f8b39efec86795961d4cb",
        html_url:
          "https://github.com/ethereum/EIPs/blob/8aca1212d7e716c9c47f8b39efec86795961d4cb/EIPS/eip-2228.md",
        git_url:
          "https://api.github.com/repos/ethereum/EIPs/git/blobs/f73ff06338a8a3aa315e7da600d84ea45e3609c9",
        download_url:
          "https://raw.githubusercontent.com/ethereum/EIPs/8aca1212d7e716c9c47f8b39efec86795961d4cb/EIPS/eip-2228.md",
        type: "file",
        content:
          "LS0tCmVpcDogMjIyOAp0aXRsZTogQ2Fub25pY2FsaXplIHRoZSBuYW1lIG9m\nIG5ldHdvcmsgSUQgMSBhbmQgY2hhaW4gSUQgMQphdXRob3I6IFdpbGxpYW0g\nRW50cmlrZW4gKEBmdWxsZGVjZW50KQpkaXNjdXNzaW9ucy10bzogaHR0cHM6\nLy9naXRodWIuY29tL2V0aGVyZXVtL0VJUHMvaXNzdWVzLzIyMjgKc3RhdHVz\nOiBGaW5hbAp0eXBlOiBJbmZvcm1hdGlvbmFsCmNyZWF0ZWQ6IDIwMTktMDgt\nMDQKLS0tCgojIyBTaW1wbGUgU3VtbWFyeQoKVGhlIEV0aGVyZXVtIG5ldHdv\ncmsgd2l0aCBuZXR3b3JrIElEIDEgYW5kIGNoYWluIElEIDEgaXMgbmFtZWQg\nRXRoZXJldW0gTWFpbm5ldC4KCiMjIEFic3RyYWN0CgpUaGUgbmFtZSBmb3Ig\ndGhlIEV0aGVyZXVtIG5ldHdvcmsgd2l0aCBuZXR3b3JrIElEIDEgYW5kIGNo\nYWluIElEIDEgc2hhbGwgYmUgRXRoZXJldW0gTWFpbm5ldCBvciBqdXN0IE1h\naW5uZXQuIFRoaXMgaXMgYSBwcm9wZXIgbm91bi4KClRoaXMgc3RhbmRhcmQg\nc3BlY2lmaWVzIHRoZSBuYW1lIGZvciB0aGlzIG5ldHdvcmsgYW5kIHByb3Zp\nZGVzIHJlZmVyZW5jZSBleGFtcGxlcyBpbiBhbiBlZmZvcnQgdG8gc3RhbmRh\ncmRpemUgdGhlIHdvcmQgY2hvaWNlIGFuZCBwcm92aWRlIGEgY29tbW9uIGxh\nbmd1YWdlIGZvciB1c2UgdG8gcmVmZXIgdG8gdGhpcyBuZXR3b3JrLgoKIyMg\nTW90aXZhdGlvbgoKVGhlIEV0aGVyZXVtIG5ldHdvcmsgd2l0aCBuZXR3b3Jr\nIElEIDEgYW5kIGNoYWluIElEIDEgaXMgcmVmZXJlbmNlZCB1c2luZyBzZXZl\ncmFsIGNvbmZsaWN0aW5nIG5hbWVzIGFjcm9zcyBFSVBzLCBjbGllbnQgaW1w\nbGVtZW50YXRpb25zLCBhbmQgaW5mb3JtYXRpb24gcHVibGlzaGVkIG9uIHRo\nZSBpbnRlcm5ldCBhdCBsYXJnZS4gSW4gc2V2ZXJhbCBsb2NhdGlvbnMsIGV2\nZW4gZG9jdW1lbnRzIHdyaXR0ZW4gYnkgdGhlIHNhbWUgYXV0aG9yIHVzZSBp\nbmNvbnNpc3RlbnQgbmFtZXMgdG8gcmVmZXIgdG8gdGhlIEV0aGVyZXVtIG5l\ndHdvcmsgd2l0aCBuZXR3b3JrIElEIDEgYW5kIGNoYWluIElEIDEuIE5hbWVz\nIGluIHVzZSBhdCB0aGUgdGltZSBvZiB0aGlzIHdyaXRpbmcgaW5jbHVkZToK\nCiogIm1haW4gbmV0IgoqICJtYWlubmV0IgoqICJNYWluIG5ldCIKKiAiTWFp\nbm5ldCIKCiMjIFNwZWNpZmljYXRpb24KClRoZSBuZXR3b3JrIG5hbWUgZm9y\nIG5ldHdvcmsgSUQgMSBhbmQgY2hhaW4gSUQgMSBzaGFsbCBiZSBFdGhlcmV1\nbSBNYWlubmV0LCBvciBqdXN0IE1haW5uZXQgaWYgdGhlIGNvbnRleHQgaXMg\na25vd24gdG8gYmUgZGlzY3Vzc2luZyBFdGhlcmV1bSBuZXR3b3Jrcy4gVGhp\ncyBJUyBhIHByb3BlciBub3VuLiBTZXZlcmFsIGV4YW1wbGVzIGFyZSBnaXZl\nbiBiZWxvdyB3aGljaCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gdXNhZ2Ugb2Yg\ndGhlIG5hbWUgb2YgdGhlIG5ldHdvcmsgdmVyc3VzIGEgZGVzY3JpcHRpdmUg\ncmVmZXJlbmNlIHRvIHRoZSBuZXR3b3JrLgoKQW55IG5hbWUgb3Igd29yZCBz\ndHlsaW5nIChpLmUuIGNhcGl0YWxpemF0aW9uIG9mIHRoZSBsZXR0ZXJzKSBv\nZiB0aGUgbmV0d29yayB3aGljaCBpcyBpbmNvbnNpc3RlbnQgd2l0aCB0aGUg\ndGVzdCBjYXNlcyBjaXRlZCBiZWxvdyBzaGFsbCBOT1QgYmUgdXNlZC4KCiMj\nIyBUcmFkZW1hcmsgbm90ZQoKIkV0aGVyZXVtIiBpcyB0cmFkZW1hcmtlZCBi\neSB0aGUgRXRoZXJldW0gRm91bmRhdGlvbi4gRm9yIG1vcmUgaW5mb3JtYXRp\nb24gb24geW91ciBvYmxpZ2F0aW9ucyB3aGVuIG1lbnRpb25pbmcgIkV0aGVy\nZXVtIiwgYW5kIHBvc3NpYmx5ICJFdGhlcmV1bSBNYWlubmV0Iiwgc2VlOgoK\nKiBVU1BUTyByZWdpc3RyYXRpb24gbnVtYmVyIDUxMTA1NzkgYnkgRXRoZXJl\ndW0gRm91bmRhdGlvbgoqIFRoZSBub3RlICJ5b3UgbXVzdCBub3QgdXNlIFt0\naGlzIG1hcmtdIHdpdGhvdXQgdGhlIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lv\nbiBvZiB0aGUgRm91bmRhdGlvbiIgb24gdGhlIEV0aGVyZXVtIEZvdW5kYXRp\nb24gd2Vic2l0ZSwgVGVybXMgb2YgVXNlIHBhZ2UKCiMjIFJhdGlvbmFsZQoK\nQ2hvb3NpbmcgY29tbW9uIHdvcmQgdXNlIHByb21vdGVzIGludGVyb3BlcmFi\naWxpdHkgb2YgaW1wbGVtZW50YXRpb25zIGFuZCBpbmNyZWFzZXMgY3VzdG9t\nZXIgYXdhcmVuZXNzLiBBbHNvLCBpdCBhZGRzIGEgc2Vuc2Ugb2YgcHJvZmVz\nc2lvbmFsaXNtIHdoZW4gY3VzdG9tZXJzIHNlZSB0aGUgc2FtZSB3b3JkIGFu\nZCB3b3JkIHN0eWxpbmcgKGkuZS4gY2FwaXRhbGl6YXRpb24gb2YgbGV0dGVy\ncykgYWNyb3NzIGRpZmZlcmVudCBpbXBsZW1lbnRhdGlvbnMuCgpBbnlib2R5\nIHRoYXQgaGFzIHRyYXZlbGxlZCB0byBjZXJ0YWluIGNvdW50cmllcyBhbmQg\nc2VlbiBhbiAiSVBob25lIFtzaWNdIiByZXBhaXIgc3RvcmUgc2hvdWxkIGlt\nbWVkaWF0ZWx5IHJlY29nbml6ZSB0aGF0IHRoaXMgaXMgb2ZmLWJyYW5kIGFu\nZCB1bm9mZmljaWFsLiBMaWtld2lzZSwgdGhlIGFzdHV0ZSBjdXN0b21lciBv\nZiBFdGhlcmV1bSBzaG91bGQgcmVjb2duaXplIGlmIHRoZXkgc2VlIHRoZSBu\nZXR3b3JrIHJlZmVycmVkIHRvIHVzaW5nIGluY29uc2lzdGVudCBuYW1lcyBp\nbiBkaWZmZXJlbnQgc29mdHdhcmUsIHNvIGxldCdzIGF2b2lkIHRoaXMuCgoj\nIyBCYWNrd2FyZHMgQ29tcGF0aWJpbGl0eQoKLSBNZXRhTWFzayBwcmV2aW91\nc2x5IHVzZWQgIk1haW4gRXRoZXJldW0gTmV0d29yayIgaW4gdGhlIGFjY291\nbnQgbmV0d29yayBjaG9vc2VyLiBNZXRhTWFzayBoYXMgYmVlbiB1cGRhdGVk\nIGNvbnNpc3RlbnQgd2l0aCB0aGlzIEVJUC4KCi0gUmVmZXJlbmNlcyB0byBN\nYWlubmV0IHRoYXQgYXJlIGluY29uc2lzdGVudCB3aXRoIHRoaXMgc3BlY2lm\naWNhdGlvbiBhcmUgbWFkZSBpbjogW0VJUC0yXSguL2VpcC0yLm1kKSwgW0VJ\nUC03NzldKC4vZWlwLTc3OS5tZCksIFtFSVAtMTUwXSguL2VpcC0xNTAubWQp\nLCBbRUlQLTE1NV0oLi9laXAtMTU1Lm1kKSwgW0VJUC0xNjFdKC4vZWlwLTE2\nMS5tZCksIFtFSVAtMTcwXSguL2VpcC0xNzAubWQpLCBbRUlQLTE5MF0oLi9l\naXAtMTkwLm1kKSwgW0VJUC0yMjVdKC4vZWlwLTIyNS5tZCksIFtFSVAtMTAx\nM10oLi9laXAtMTAxMy5tZCksIFtFSVAtMTY3OV0oLi9laXAtMTY3OS5tZCks\nIFtFSVAtMTcxNl0oLi9laXAtMTcxNi5tZCksIFtFSVAtMjAyOF0oLi9laXAt\nMjAyOC5tZCksIFtFSVAtMjIwMF0oLi9laXAtMjIwMC5tZCksIGFuZCBbRUlQ\nLTIzODddKC4vZWlwLTIzODcubWQpLiBGb3IgY29uc2lzdGVuY3ksIHdlIHJl\nY29tbWVuZCB0aGUgZWRpdG9yIHdpbGwgdXBkYXRlIEVJUHMgdG8gY29uc2lz\ndGVudGx5IHVzZSB0aGUgbmFtZSBhcyBzcGVjaWZpZWQgaW4gdGhpcyBFSVAu\nCgojIyBUZXN0IENhc2VzCgojIyMgRXhhbXBsZXMgcmVmZXJlbmNpbmcgdGhl\nIG5hbWUgb2YgdGhlIG5ldHdvcmsg4pyFCgo+IFRoZSBjb250cmFjdCB3YXMg\nZGVwbG95ZWQgdG8gRXRoZXJldW0gTWFpbm5ldC4KCj4gRXRoZXJldW0gcnVu\ncyBtYW55IGFwcGxpY2F0aW9ucywgdGhpcyBEYXBwIHdhcyBkZXBsb3llZCB0\nbyBNYWlubmV0LgoKTm8gc3BlY2lmaWNhdGlvbiBpcyBtYWRlIG9uIHdoZXRo\nZXIgRGFwcCwgZGFwcCwgZEFwcCwgZXRjLiBpcyBwcmVmZXJyZWQuCgo+IFNX\nSVRDSCBUTyBNQUlOTkVUCgpUaGlzIGV4YW1wbGUgc2hvd3MgYSB1c2VyIGlu\ndGVyZmFjZSB3aGljaCBpcyBpbiB1cHBlcmNhc2UuIFRvIGJlIHNlbWFudGlj\nYWxseSBjb3JyZWN0LCB0aGlzIGNvdWxkIGJlIHdyaXR0ZW4gaW4gSFRNTCBh\ncyBgPHNwYW4gc3R5bGU9InRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2UiPlN3\naXRjaCB0byBNYWlubmV0PC9zcGFuPmAuCgo+IHN3aXRjaCB0byBtYWlubmV0\nCgpUaGlzIGV4YW1wbGUgc2hvd3MgYSB1c2VyIGludGVyZmFjZSB3aGljaCBp\ncyBpbiBsb3dlcmNhc2UuIFRvIGJlIHNlbWFudGljYWxseSBjb3JyZWN0LCB0\naGlzIGNvdWxkIGJlIHdyaXR0ZW4gaW4gSFRNTCBhcyBgPHNwYW4gc3R5bGU9\nInRleHQtdHJhbnNmb3JtOiBsb3dlcmNhc2UiPlN3aXRjaCB0byBNYWlubmV0\nPC9zcGFuPmAuCgojIyMgRXhhbXBsZXMgcmVmZXJlbmNpbmcgdGhlIG5ldHdv\ncmsgaW4gYSBkZXNjcmlwdGl2ZSB3YXkg4pyFCgo+IE1haW5uZXQgaGFzICMj\nIyB0aW1lcyB0aGUgbnVtYmVyIG9mIHRyYW5zYWN0aW9ucyBhcyB0aGUgdGVz\ndCBuZXR3b3Jrcy4KCiMjIyBFeGFtcGxlcyBvZiBvdGhlciBjb3JyZWN0IHdv\ncmQgdXNhZ2Ug4pyFCgo+IFRoZSBtYWluIG5ldHdvcmsgb24gRXRoZXJldW0g\naXMgTWFpbm5ldAoKVGhpcyBzaG93cyB0aGF0ICJtYWluIiBpcyB1c2VkIGFz\nIGEgZGVzY3JpcHRpdmUgd29yZCwgYnV0IE1haW5uZXQgaXMgdGhlIHNwZWNp\nZmljIG5ldHdvcmsgd2hpY2ggaXMgaGF2aW5nIG5ldHdvcmsgSUQgMSBhbmQg\nY2hhaW4gSUQgMS4KCiMjIyBFeGFtcGxlcyBvZiBwb29yIHdvcmQgY2hvaWNl\nIChhdm9pZCB0aGlzKSDinYwKCj4gRGVwbG95IHlvdXIgY29udHJhY3QgdG8g\ndGhlIEV0aGVyZXVtIG1haW4gbmV0d29yay4KClRoaXMgaXMgcmVmZXJyaW5n\nIHRvIGEgIm1haW4iIG5ldHdvcmsgd2hpY2ggaXMgY29udGV4dC1kZXBlbmRl\nbnQuIElmIHlvdSB3ZXJlIHJlYWRpbmcgdGhpcyB0ZXh0IG9uIGEgcGFnZSBh\nYm91dCBFdGhlcmV1bSBDbGFzc2ljLCB0aGV5IHdvdWxkIGJlIHJlZmVycmlu\nZyB0byBuZXR3b3JrIElEIDIgYW5kIGNoYWluIElEIDYyLiBUaGVyZWZvcmUg\ndGhpcyB3b3JkIHVzYWdlIGlzIGxlc3MgY3Jpc3AuIERvIE5PVCB1c2Ugd29y\nZGluZyBsaWtlIHRoaXMuCgo+IENvbm5lY3QgdG8gbWFpbm5ldC4KClRoZXNl\nIHdvcmRzIGxpdGVyYWxseSBtZWFuIG5vdGhpbmcuIFRoZSBsb3dlcmNhc2Us\nIG5vdC1wcm9wZXItbm91biB3b3JkICJtYWlubmV0IiBpcyBub3QgYSBwbGFp\nbiBFbmdsaXNoIHdvcmQgYW5kIGl0IHNob3VsZCBub3QgYmUgaW4gYW55IGRp\nY3Rpb25hcnkuIERvIE5PVCB1c2Ugd29yZGluZyBsaWtlIHRoaXMuCgojIyBD\nb3B5cmlnaHQKCkNvcHlyaWdodCBhbmQgcmVsYXRlZCByaWdodHMgd2FpdmVk\nIHZpYSBbQ0MwXShodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGlj\nZG9tYWluL3plcm8vMS4wLykuCg==\n",
        encoding: "base64",
        _links: {
          self:
            "https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-2228.md?ref=8aca1212d7e716c9c47f8b39efec86795961d4cb",
          git:
            "https://api.github.com/repos/ethereum/EIPs/git/blobs/f73ff06338a8a3aa315e7da600d84ea45e3609c9",
          html:
            "https://github.com/ethereum/EIPs/blob/8aca1212d7e716c9c47f8b39efec86795961d4cb/EIPS/eip-2228.md"
        }
      }
    }
  },
  {
    req: {
      method: "GET",
      url: "https://api.github.com/repos/ethereum/EIPs/pulls/3654/reviews"
    },
    res: {
      status: 200,
      data: [
        {
          id: 706946210,
          node_id: "MDE3OlB1bGxSZXF1ZXN0UmV2aWV3NzA2OTQ2MjEw",
          user: {
            login: "MicahZoltu",
            id: 886059,
            node_id: "MDQ6VXNlcjg4NjA1OQ==",
            avatar_url:
              "https://avatars.githubusercontent.com/u/886059?u=408de357d90aae9b9ffc956970b8fd4eec642060&v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/MicahZoltu",
            html_url: "https://github.com/MicahZoltu",
            followers_url: "https://api.github.com/users/MicahZoltu/followers",
            following_url:
              "https://api.github.com/users/MicahZoltu/following{/other_user}",
            gists_url:
              "https://api.github.com/users/MicahZoltu/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/MicahZoltu/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/MicahZoltu/subscriptions",
            organizations_url: "https://api.github.com/users/MicahZoltu/orgs",
            repos_url: "https://api.github.com/users/MicahZoltu/repos",
            events_url:
              "https://api.github.com/users/MicahZoltu/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/MicahZoltu/received_events",
            type: "User",
            site_admin: false
          },
          body: "",
          state: "APPROVED",
          html_url:
            "https://github.com/ethereum/EIPs/pull/3654#pullrequestreview-706946210",
          pull_request_url:
            "https://api.github.com/repos/ethereum/EIPs/pulls/3654",
          author_association: "COLLABORATOR",
          _links: {
            html: {
              href:
                "https://github.com/ethereum/EIPs/pull/3654#pullrequestreview-706946210"
            },
            pull_request: {
              href: "https://api.github.com/repos/ethereum/EIPs/pulls/3654"
            }
          },
          submitted_at: "2021-07-15T05:49:01Z",
          commit_id: "8aca1212d7e716c9c47f8b39efec86795961d4cb"
        }
      ]
    }
  },
  {
    req: {
      method: "GET",
      url: "https://api.github.com/user"
    },
    res: {
      status: 200,
      data: {
        login: "eth-bot",
        id: 85952233,
        node_id: "MDQ6VXNlcjg1OTUyMjMz",
        avatar_url: "https://avatars.githubusercontent.com/u/85952233?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/eth-bot",
        html_url: "https://github.com/eth-bot",
        followers_url: "https://api.github.com/users/eth-bot/followers",
        following_url:
          "https://api.github.com/users/eth-bot/following{/other_user}",
        gists_url: "https://api.github.com/users/eth-bot/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/eth-bot/starred{/owner}{/repo}",
        subscriptions_url: "https://api.github.com/users/eth-bot/subscriptions",
        organizations_url: "https://api.github.com/users/eth-bot/orgs",
        repos_url: "https://api.github.com/users/eth-bot/repos",
        events_url: "https://api.github.com/users/eth-bot/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/eth-bot/received_events",
        type: "User",
        site_admin: false,
        name: null,
        company: null,
        blog: "",
        location: null,
        email: null,
        hireable: null,
        bio: null,
        twitter_username: null,
        public_repos: 0,
        public_gists: 0,
        followers: 1,
        following: 0,
        created_at: "2021-06-15T15:27:49Z",
        updated_at: "2021-06-15T19:43:12Z"
      }
    }
  },
  {
    req: {
      method: "GET",
      url: "https://api.github.com/repos/ethereum/EIPs/issues/3654/comments"
    },
    res: {
      status: 200,
      data: [
        {
          url:
            "https://api.github.com/repos/ethereum/EIPs/issues/comments/880074335",
          html_url:
            "https://github.com/ethereum/EIPs/pull/3654#issuecomment-880074335",
          issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
          id: 880074335,
          node_id: "MDEyOklzc3VlQ29tbWVudDg4MDA3NDMzNQ==",
          user: {
            login: "eth-bot",
            id: 85952233,
            node_id: "MDQ6VXNlcjg1OTUyMjMz",
            avatar_url: "https://avatars.githubusercontent.com/u/85952233?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/eth-bot",
            html_url: "https://github.com/eth-bot",
            followers_url: "https://api.github.com/users/eth-bot/followers",
            following_url:
              "https://api.github.com/users/eth-bot/following{/other_user}",
            gists_url: "https://api.github.com/users/eth-bot/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/eth-bot/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/eth-bot/subscriptions",
            organizations_url: "https://api.github.com/users/eth-bot/orgs",
            repos_url: "https://api.github.com/users/eth-bot/repos",
            events_url: "https://api.github.com/users/eth-bot/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/eth-bot/received_events",
            type: "User",
            site_admin: false
          },
          created_at: "2021-07-14T17:25:02Z",
          updated_at: "2021-07-14T17:25:02Z",
          author_association: "COLLABORATOR",
          body:
            "Hi! I'm a bot, and I wanted to automerge your PR, but couldn't because of the following issue(s):\n\n\n\t - EIP 2228 state was changed from last call to final\n\t - eip-2228.md is in state final, not draft or last call or review; an EIP editor needs to approve this change\n\t - This PR requires review from one of [@MicahZoltu, @lightclient, @arachnid, @cdetrio, @Souptacular, @vbuterin, @nicksavers, @wanderer, @gcolvin, @axic]",
          performed_via_github_app: null
        },
        {
          url:
            "https://api.github.com/repos/ethereum/EIPs/issues/comments/880074717",
          html_url:
            "https://github.com/ethereum/EIPs/pull/3654#issuecomment-880074717",
          issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
          id: 880074717,
          node_id: "MDEyOklzc3VlQ29tbWVudDg4MDA3NDcxNw==",
          user: {
            login: "fulldecent",
            id: 382183,
            node_id: "MDQ6VXNlcjM4MjE4Mw==",
            avatar_url: "https://avatars.githubusercontent.com/u/382183?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/fulldecent",
            html_url: "https://github.com/fulldecent",
            followers_url: "https://api.github.com/users/fulldecent/followers",
            following_url:
              "https://api.github.com/users/fulldecent/following{/other_user}",
            gists_url:
              "https://api.github.com/users/fulldecent/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/fulldecent/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/fulldecent/subscriptions",
            organizations_url: "https://api.github.com/users/fulldecent/orgs",
            repos_url: "https://api.github.com/users/fulldecent/repos",
            events_url:
              "https://api.github.com/users/fulldecent/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/fulldecent/received_events",
            type: "User",
            site_admin: false
          },
          created_at: "2021-07-14T17:25:36Z",
          updated_at: "2021-07-14T17:25:36Z",
          author_association: "CONTRIBUTOR",
          body: "Requesting merge please @alita-moore",
          performed_via_github_app: null
        },
        {
          url:
            "https://api.github.com/repos/ethereum/EIPs/issues/comments/880095123",
          html_url:
            "https://github.com/ethereum/EIPs/pull/3654#issuecomment-880095123",
          issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
          id: 880095123,
          node_id: "MDEyOklzc3VlQ29tbWVudDg4MDA5NTEyMw==",
          user: {
            login: "alita-moore",
            id: 26529820,
            node_id: "MDQ6VXNlcjI2NTI5ODIw",
            avatar_url: "https://avatars.githubusercontent.com/u/26529820?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/alita-moore",
            html_url: "https://github.com/alita-moore",
            followers_url: "https://api.github.com/users/alita-moore/followers",
            following_url:
              "https://api.github.com/users/alita-moore/following{/other_user}",
            gists_url:
              "https://api.github.com/users/alita-moore/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/alita-moore/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/alita-moore/subscriptions",
            organizations_url: "https://api.github.com/users/alita-moore/orgs",
            repos_url: "https://api.github.com/users/alita-moore/repos",
            events_url:
              "https://api.github.com/users/alita-moore/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/alita-moore/received_events",
            type: "User",
            site_admin: false
          },
          created_at: "2021-07-14T17:57:08Z",
          updated_at: "2021-07-14T17:57:08Z",
          author_association: "CONTRIBUTOR",
          body: "cc @MicahZoltu @lightclient ",
          performed_via_github_app: null
        },
        {
          url:
            "https://api.github.com/repos/ethereum/EIPs/issues/comments/882916266",
          html_url:
            "https://github.com/ethereum/EIPs/pull/3654#issuecomment-882916266",
          issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
          id: 882916266,
          node_id: "IC_kwDOAq426M40oDuq",
          user: {
            login: "alita-moore",
            id: 26529820,
            node_id: "MDQ6VXNlcjI2NTI5ODIw",
            avatar_url: "https://avatars.githubusercontent.com/u/26529820?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/alita-moore",
            html_url: "https://github.com/alita-moore",
            followers_url: "https://api.github.com/users/alita-moore/followers",
            following_url:
              "https://api.github.com/users/alita-moore/following{/other_user}",
            gists_url:
              "https://api.github.com/users/alita-moore/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/alita-moore/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/alita-moore/subscriptions",
            organizations_url: "https://api.github.com/users/alita-moore/orgs",
            repos_url: "https://api.github.com/users/alita-moore/repos",
            events_url:
              "https://api.github.com/users/alita-moore/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/alita-moore/received_events",
            type: "User",
            site_admin: false
          },
          created_at: "2021-07-19T23:02:40Z",
          updated_at: "2021-07-19T23:02:40Z",
          author_association: "CONTRIBUTOR",
          body:
            "weird, @MicahZoltu should this have auto merged provided that you approved it?",
          performed_via_github_app: null
        },
        {
          url:
            "https://api.github.com/repos/ethereum/EIPs/issues/comments/882918160",
          html_url:
            "https://github.com/ethereum/EIPs/pull/3654#issuecomment-882918160",
          issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
          id: 882918160,
          node_id: "IC_kwDOAq426M40oEMQ",
          user: {
            login: "fulldecent",
            id: 382183,
            node_id: "MDQ6VXNlcjM4MjE4Mw==",
            avatar_url: "https://avatars.githubusercontent.com/u/382183?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/fulldecent",
            html_url: "https://github.com/fulldecent",
            followers_url: "https://api.github.com/users/fulldecent/followers",
            following_url:
              "https://api.github.com/users/fulldecent/following{/other_user}",
            gists_url:
              "https://api.github.com/users/fulldecent/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/fulldecent/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/fulldecent/subscriptions",
            organizations_url: "https://api.github.com/users/fulldecent/orgs",
            repos_url: "https://api.github.com/users/fulldecent/repos",
            events_url:
              "https://api.github.com/users/fulldecent/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/fulldecent/received_events",
            type: "User",
            site_admin: false
          },
          created_at: "2021-07-19T23:06:29Z",
          updated_at: "2021-07-19T23:06:29Z",
          author_association: "CONTRIBUTOR",
          body:
            "Here is the relevant bot error message which as @alita-moore notes, is inaccurate:\r\n\r\n> https://github.com/ethereum/EIPs/pull/3654/checks?check_run_id=3073655592#step:4:17\r\n\r\nRequesting manual merge here please and then bot fixing where that happens.",
          performed_via_github_app: null
        },
        {
          url:
            "https://api.github.com/repos/ethereum/EIPs/issues/comments/882921561",
          html_url:
            "https://github.com/ethereum/EIPs/pull/3654#issuecomment-882921561",
          issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
          id: 882921561,
          node_id: "IC_kwDOAq426M40oFBZ",
          user: {
            login: "alita-moore",
            id: 26529820,
            node_id: "MDQ6VXNlcjI2NTI5ODIw",
            avatar_url: "https://avatars.githubusercontent.com/u/26529820?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/alita-moore",
            html_url: "https://github.com/alita-moore",
            followers_url: "https://api.github.com/users/alita-moore/followers",
            following_url:
              "https://api.github.com/users/alita-moore/following{/other_user}",
            gists_url:
              "https://api.github.com/users/alita-moore/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/alita-moore/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/alita-moore/subscriptions",
            organizations_url: "https://api.github.com/users/alita-moore/orgs",
            repos_url: "https://api.github.com/users/alita-moore/repos",
            events_url:
              "https://api.github.com/users/alita-moore/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/alita-moore/received_events",
            type: "User",
            site_admin: false
          },
          created_at: "2021-07-19T23:13:17Z",
          updated_at: "2021-07-19T23:13:17Z",
          author_association: "CONTRIBUTOR",
          body: "okay I'll make a ticket to investigate what's going on here",
          performed_via_github_app: null
        }
      ]
    }
  },
  {
    req: {
      method: "PATCH",
      url:
        "https://api.github.com/repos/ethereum/EIPs/issues/comments/880074335",
      body:
        '{"body":"Hi! I\'m a bot, and I wanted to automerge your PR, but couldn\'t because of the following issue(s):\\n\\n\\n\\t - eip-2228.md is in state final at the head commit, not draft or last call or review; an EIP editor needs to approve this change\\n\\t - This PR requires review from one of [@MicahZoltu, @lightclient, @arachnid, @cdetrio, @Souptacular, @vbuterin, @nicksavers, @wanderer, @gcolvin, @axic]"}'
    },
    res: {
      status: 200,
      data: {
        url:
          "https://api.github.com/repos/ethereum/EIPs/issues/comments/880074335",
        html_url:
          "https://github.com/ethereum/EIPs/pull/3654#issuecomment-880074335",
        issue_url: "https://api.github.com/repos/ethereum/EIPs/issues/3654",
        id: 880074335,
        node_id: "MDEyOklzc3VlQ29tbWVudDg4MDA3NDMzNQ==",
        user: {
          login: "eth-bot",
          id: 85952233,
          node_id: "MDQ6VXNlcjg1OTUyMjMz",
          avatar_url: "https://avatars.githubusercontent.com/u/85952233?v=4",
          gravatar_id: "",
          url: "https://api.github.com/users/eth-bot",
          html_url: "https://github.com/eth-bot",
          followers_url: "https://api.github.com/users/eth-bot/followers",
          following_url:
            "https://api.github.com/users/eth-bot/following{/other_user}",
          gists_url: "https://api.github.com/users/eth-bot/gists{/gist_id}",
          starred_url:
            "https://api.github.com/users/eth-bot/starred{/owner}{/repo}",
          subscriptions_url:
            "https://api.github.com/users/eth-bot/subscriptions",
          organizations_url: "https://api.github.com/users/eth-bot/orgs",
          repos_url: "https://api.github.com/users/eth-bot/repos",
          events_url: "https://api.github.com/users/eth-bot/events{/privacy}",
          received_events_url:
            "https://api.github.com/users/eth-bot/received_events",
          type: "User",
          site_admin: false
        },
        created_at: "2021-07-14T17:25:02Z",
        updated_at: "2021-07-24T07:00:26Z",
        author_association: "COLLABORATOR",
        body:
          "Hi! I'm a bot, and I wanted to automerge your PR, but couldn't because of the following issue(s):\n\n\n\t - eip-2228.md is in state final at the head commit, not draft or last call or review; an EIP editor needs to approve this change\n\t - This PR requires review from one of [@MicahZoltu, @lightclient, @arachnid, @cdetrio, @Souptacular, @vbuterin, @nicksavers, @wanderer, @gcolvin, @axic]",
        performed_via_github_app: null
      }
    }
  }
] as MockRecord[];
