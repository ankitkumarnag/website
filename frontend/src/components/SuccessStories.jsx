import potholeBefore from "../assets/pothole-before.webp";
import roadAfter from "../assets/road-after.webp";

function SuccessStories() {
  return (
    <section className="stories-section" aria-labelledby="stories-title">
      <div className="stories-copy">
        <span>Success Stories</span>
        <h2 id="stories-title">
          Real changes.
          <strong>Stronger communities.</strong>
        </h2>
        <p>
          Transparent reporting connects citizens and departments, turning a
          local problem into visible action.
        </p>
        <a href="#impact">Explore our impact →</a>
      </div>

      <div className="before-after">
        <figure>
          <img src={potholeBefore} alt="Damaged road before civic action" />
          <figcaption className="before-label">Before</figcaption>
        </figure>
        <figure>
          <img src={roadAfter} alt="Smooth repaired road after civic action" />
          <figcaption className="after-label">After</figcaption>
        </figure>
      </div>
    </section>
  );
}

export default SuccessStories;
