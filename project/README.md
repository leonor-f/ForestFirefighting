# CG 2024/2025

## Class: T03 | Group: G03

## Group Members
| Name           | Number    | E-Mail              |
| -------------- | --------- | ------------------- |
| Leonor Santos  | 202204354 | up202204354@up.pt   |
| Miguel Mateus  | 202206944 | up202206944@up.pt   |

## Observations
- All main features described in the assignment have been implemented.
- An **additional feature** was added to allow increasing the number of floors in the firefighters' building through a slider in the GUI.

### Helicopter
- The helicopter can be controlled by the user.
- Its main features include taking off, landing, collecting water from the lake, and dropping it over the fire.
- Controls:
    - `P` — Take off
    - `L` — Land (or collect water if over the lake)
    - `O` — Drop water (if bucket is full)
    - `W` — Move forward
    - `S` — Brake
    - `A` — Turn left
    - `D` — Turn right
    - `R` — Reset helicopter position

### Fire
- The fire is simulated with multiple animated pyramids, each with a fire texture and oscillating movements (upwards, sideways, and tilting), creating a realistic effect.
- Flames appear in strategic locations in the forest, between trees, and can be partially hidden by them, simulating forest fires.

### Lake
- The lake serves as a water source for the helicopter.
- The helicopter must be positioned over the lake to fill its water bucket.

### Interactions
- To extinguish the fire, the user must pilot the helicopter to the lake, collect water, and then drop it over the burning areas.
- The fire is gradually extinguished in the areas hit by water, with visual feedback.
- The cycle can be repeated to put out all fire sources.

### Graphical Interface
- The interface was designed to look as realistic and visually appealing as possible, providing an immersive experience for the user.

> For more details, explore the project's graphical interface (GUI) and the [report](https://docs.google.com/document/d/e/2PACX-1vS1uzAAxmUxt5PvMJ2I1kwschqIaN-l-KsVdaDxgk95o2Ro0mFuEfFtkPNTrQiACPebo1UjZ3j-01SU/pub) for additional instructions.


## Screenshots of the Implemented Features

### 1.2 Adding Panoramas

![Screenshot 1](screenshots/project-t03g03-1a.png)
![Screenshot 2](screenshots/project-t03g03-1b.png)

### 2. Firefighters Building

![Screenshot 3](screenshots/project-t03g03-2.png)

### 3. Forest

![Screenshot 4](screenshots/project-t03g03-3.png)

### 4. Helicopter

![Screenshot 5](screenshots/project-t03g03-4a.png)
![Screenshot 6](screenshots/project-t03g03-4b.png)

### 5. Water and Fire

![Screenshot 7](screenshots/project-t03g03-5.png)