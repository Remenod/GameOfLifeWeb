type: modal
### Alt Mode

In your Life simulation, there are two distinct calculation modes:

- **Standard Mode** (default)
- **Alt Mode** (optimized for sparse fields)

Each mode determines how the simulation processes cell updates per generation.

---

#### How It Works

**Standard Mode:**

- Uses a flat array of size `width × height`.
- Every single cell is evaluated every generation, regardless of whether it’s alive or dead.
- Best suited for **dense or fully-filled grids**, as it processes everything uniformly.

**Alt Mode:**

- Uses a `HashSet` to store the indices of potentially active cells.
- On each step:
  - All *currently alive* cells are checked for survival.
  - All *dead neighbors* within a **5×5 square** around each live cell are checked for possible birth.
- Ideal for **sparse** fields, where most of the grid is empty.

---

#### Performance Comparison

| Scenario                        | Standard Mode                  | Alt Mode                                  |
| ------------------------------- | ------------------------------ | ----------------------------------------- |
| **Small grid, mostly filled**   | Fast, stable                   | Slightly slower due to HashSet overhead   |
| **Large grid, mostly empty**    | Very slow (unnecessary checks) | Very fast (only evaluates near-life)      |
| **Large grid, fully filled**    | Uniform performance            | Much slower (too many surrounding checks) |
| **Stable/oscillating patterns** | Consistent, low-jitter         | Slight variations based on hash order     |

---

#### Stability & Behavior

- Standard Mode gives **predictable and reproducible results**. The full field is treated uniformly.
- Alt Mode is **non-deterministic in memory layout**, which may affect:
  - iteration order,
  - timing on some platforms (if timing is visible),
  - edge behavior (especially near hash collisions).

---

#### Recommendation

| Field Type             | Recommended Mode |
| ---------------------- | ---------------- |
| Small & Dense          | Standard         |
| Large & Sparse         | **Alt**          |
| Precise repeatability  | Standard         |
| Generative art / chaos | Alt              |

If your simulation often features large fields with just a few active areas (e.g. gliders, guns, or slowly growing structures), **Alt Mode provides significant performance benefits**.

But if you're working with tightly packed configurations or need exact reproducibility, stick with **Standard Mode**.
