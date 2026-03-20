Overall infra + tooling

TEST URL: http://localhost:4173/results?dims=djE6c3RyYXRlZ3k6NDYsYWRhcHRhYmlsaXR5OjM5LGNvbGxhYm9yYXRpb246NDYsZXhwZXJpbWVudGF0aW9uOjMzLGltcGFjdDo0NA%3D%3D


- [ ] automate copyright date into compile
- [ ] fix mobile menu ugliness
- [ ] fix desktop header ugliness
- [ ] restructure the homepage like this: https://godly.website/website/quentin-hocde-736
- [ ] just use this, ditch all the React crap (might not be totally possible because we need a 3d rendering library): https://threejs.org/docs/scenes/geometry-browser.html#DodecahedronGeometry
    - [ ] Even better, what if we throw everything away and just use raw HTML canvas APIs? The hardest part will be filling solid faces, but that code should already exist https://github.com/tsoding/formula
    - [ ] Alternate solution, move to svelte x three? https://threlte.xyz/
    - [ ] or drei vanilla? https://github.com/pmndrs/drei-vanilla
- [ ] if we keep react... can try adding a mouse trail like the last example here: https://blog.maximeheckel.com/posts/post-processing-as-a-creative-medium/
- [ ] more inspo: https://r3f.maximeheckel.com/refraction

New features

- [ ] about page
- [ ] full copyright disclaimer in footer: Copyright &copy; 2024–2026 Shakeel Mohamed all rights reserved. No part of this thesis project may be reproduced or transmitted in any form by any electronic or mechanical means, which may include photocopying, recording, or any other information storage and retrieval system, or otherwise without written permission from the publisher.
- [ ] links to Whatsapp groups
- [ ] Redesign the homepage, scale should be much better in general (see above)
- [ ] Quiz: Card stack UI with easing: https://codesandbox.io/p/sandbox/reacr-stacked-d37w8w?file=/src/components/card.jsx
- [ ] Add pages for each archetype with: description, example designer, etc.


More reference for UI standard components https://ui.aceternity.com/components

Future notes for the quiz from Claude:

What to Track for v2
Once live, monitor:

Which archetypes users actually get (does real data match brute force?)
Which results get shared most (engagement signal)
Any feedback about results feeling "off" or too common
Drop-off points (which questions lose people?)

After 50-100 responses:

Analyze actual distribution
Compare to brute force prediction
Decide if reweighting needed or if distribution is actually fine


The Reality Check
Brute force analysis assumes:

Equal likelihood of every answer to every question
No human behavioral patterns (people don't answer randomly)

Real users:

Have answer biases (certain options more appealing)
Skip extremes (rarely pick "strongly" options)
Self-select (designers taking this quiz ≠ random sample)

Actual distribution might be MORE balanced than brute force suggests.
Or it might be even more skewed.
You won't know until real people take it.