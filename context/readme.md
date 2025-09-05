# Context Folder Guide

This is a simple guide to the files in the context folder:

## File Descriptions

**National Curriculum Framework** - Summarises the UK maths curriculum for key stages 1 and 2.

**Example Questions.json** - Contains example questions for each of the sub-strands in the national curriculum framework. This is used to collate example questions for each sub-strand. The questions in this file have been sourced from reputable and trusted educational websites in the UK.

**Factory Blueprint Prompt** - An example prompt used with a large language model to design and build a question factory which can be used to algorithmically generate questions for a curriculum item and vary the difficulty as needed. This would be used to create a pre-curated bank of questions which gradually get more difficult as the user progresses through the curriculum.

**Factory Blueprint Response** - An example response from using the factory blueprint prompt with a high-quality thinking large language model.

**Implementation Next Steps** - My thoughts on how to build this out so that I can create an application with a simple UI to create and test question generation for a specific strand or sub-strand from the UK maths curriculum.

## Project Goal

My goal is to create a flexible way to generate questions where I can subtly alter the difficulty by changing different parameters and then add a story layer to the results. This means that when students read the questions, the maths could actually be related to pounds, sea shells, or other objects - so the maths and the story are applied in two separate layers.